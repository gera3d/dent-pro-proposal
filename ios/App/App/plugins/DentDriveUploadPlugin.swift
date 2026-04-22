import Foundation
import Capacitor
import os.log

private let driveUploadLog = OSLog(subsystem: "com.dentexperts.scoper", category: "DentDriveUpload")
private let driveUploadConcurrency = 4

private struct PreparedUploadFile {
    let index: Int
    let fileName: String
    let mimeType: String
    let sourceURL: URL
    let fileSize: Int
    let cleanupAfterUpload: Bool
    let base64Data: String?
}

private struct UploadSessionDescriptor {
    let index: Int
    let fileName: String
    let uploadURL: URL
}

@objc(DentDriveUpload)
public class DentDriveUploadPlugin: CAPPlugin, CAPBridgedPlugin {

    public let identifier = "DentDriveUploadPlugin"
    public let jsName = "DentDriveUpload"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "persistPhoto", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "deleteFiles", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "uploadBatch", returnType: CAPPluginReturnPromise)
    ]

    private static let tempFolderName = "DentDriveUploads"
    private static let maxTempFileAge: TimeInterval = 60 * 60 * 24 * 3

    private lazy var session: URLSession = {
        let config = URLSessionConfiguration.default
        config.waitsForConnectivity = true
        config.timeoutIntervalForRequest = 120
        config.timeoutIntervalForResource = 300
        return URLSession(configuration: config)
    }()

    public override func load() {
        super.load()
        do {
            try Self.pruneStaleFiles()
        } catch {
            os_log("Could not prune stale native upload files: %{public}@",
                   log: driveUploadLog, type: .error, error.localizedDescription)
        }
    }

    @objc func persistPhoto(_ call: CAPPluginCall) {
        guard let fileName = call.getString("fileName")?.trimmingCharacters(in: .whitespacesAndNewlines),
              !fileName.isEmpty else {
            call.reject("fileName is required.")
            return
        }

        let mimeType = call.getString("mimeType")?.trimmingCharacters(in: .whitespacesAndNewlines) ?? "image/jpeg"
        let base64Raw = call.getString("base64Data") ?? ""
        let base64Data = Self.normalizeBase64Payload(base64Raw)
        guard !base64Data.isEmpty else {
            call.reject("base64Data is required.")
            return
        }

        guard let data = Data(base64Encoded: base64Data, options: .ignoreUnknownCharacters),
              !data.isEmpty else {
            call.reject("base64Data is not valid.")
            return
        }

        do {
            let rootURL = try Self.ensureUploadRoot()
            let safeName = Self.sanitizedFileName(fileName, mimeType: mimeType)
            let fileURL = rootURL.appendingPathComponent("\(UUID().uuidString)-\(safeName)")
            try data.write(to: fileURL, options: .atomic)
            call.resolve([
                "nativeFilePath": fileURL.path,
                "fileSize": data.count,
                "fileName": safeName,
                "mimeType": mimeType
            ])
        } catch {
            os_log("Failed to persist native upload file: %{public}@",
                   log: driveUploadLog, type: .error, error.localizedDescription)
            call.reject("Could not persist photo: \(error.localizedDescription)")
        }
    }

    @objc func deleteFiles(_ call: CAPPluginCall) {
        guard let filePaths = call.getArray("filePaths", String.self),
              !filePaths.isEmpty else {
            call.resolve([
                "deletedCount": 0
            ])
            return
        }

        var deletedCount = 0
        for rawPath in Set(filePaths) {
            let path = rawPath.trimmingCharacters(in: .whitespacesAndNewlines)
            guard !path.isEmpty else { continue }
            do {
                let fileURL = URL(fileURLWithPath: path).standardizedFileURL
                let root = try Self.ensureUploadRoot().standardizedFileURL.path
                guard fileURL.path.hasPrefix(root) else { continue }
                if FileManager.default.fileExists(atPath: fileURL.path) {
                    try FileManager.default.removeItem(at: fileURL)
                    deletedCount += 1
                }
            } catch {
                os_log("Could not delete native upload file %{public}@: %{public}@",
                       log: driveUploadLog, type: .error, path, error.localizedDescription)
            }
        }

        call.resolve([
            "deletedCount": deletedCount
        ])
    }

    @objc func uploadBatch(_ call: CAPPluginCall) {
        guard let endpoint = call.getString("endpoint"),
              let url = URL(string: endpoint) else {
            call.reject("A valid upload endpoint is required.")
            return
        }

        let folderName = call.getString("folderName")?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        let folderId = call.getString("folderId")?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""

        guard !folderName.isEmpty || !folderId.isEmpty else {
            call.reject("folderName or folderId is required.")
            return
        }

        guard let files = call.options["files"] as? [[String: Any]],
              !files.isEmpty else {
            call.reject("At least one file is required.")
            return
        }

        do {
            let preparedFiles = try Self.prepareUploadFiles(from: files)
            let startedAt = Date()

            os_log("Uploading %{public}d file(s) to %{public}@",
                   log: driveUploadLog, type: .debug, preparedFiles.count, folderName.isEmpty ? folderId : folderName)
            performLegacyUpload(
                endpoint: url,
                folderName: folderName,
                folderId: folderId,
                files: preparedFiles,
                startedAt: startedAt,
                transportLabel: "native-legacy",
                call: call
            )
        } catch {
            call.reject("Could not prepare upload files: \(error.localizedDescription)")
        }
    }

    private func requestUploadSessions(endpoint: URL,
                                       folderName: String,
                                       files: [PreparedUploadFile],
                                       completion: @escaping (Result<[String: Any], Error>) -> Void) {
        let body: [String: Any] = [
            "action": "createUploadSessions",
            "folderName": folderName,
            "files": files.map { file in
                [
                    "fileName": file.fileName,
                    "mimeType": file.mimeType,
                    "fileSize": file.fileSize
                ]
            }
        ]

        let payload: Data
        do {
            payload = try JSONSerialization.data(withJSONObject: body, options: [])
        } catch {
            completion(.failure(error))
            return
        }

        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.httpBody = payload
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        session.dataTask(with: request) { data, response, error in
            if let error {
                completion(.failure(error))
                return
            }

            guard let httpResponse = response as? HTTPURLResponse else {
                completion(.failure(NSError(domain: "DentDriveUpload", code: 10, userInfo: [NSLocalizedDescriptionKey: "Missing upload-session response."])))
                return
            }

            guard let data else {
                completion(.failure(NSError(domain: "DentDriveUpload", code: 11, userInfo: [NSLocalizedDescriptionKey: "Empty upload-session response."])))
                return
            }

            guard (200 ... 299).contains(httpResponse.statusCode) else {
                let rawText = String(data: data, encoding: .utf8) ?? ""
                completion(.failure(NSError(domain: "DentDriveUpload", code: httpResponse.statusCode, userInfo: [NSLocalizedDescriptionKey: "Upload-session request failed with HTTP \(httpResponse.statusCode): \(rawText)"])))
                return
            }

            do {
                let json = try JSONSerialization.jsonObject(with: data, options: [])
                guard let payload = json as? [String: Any] else {
                    throw NSError(domain: "DentDriveUpload", code: 12, userInfo: [NSLocalizedDescriptionKey: "Upload-session response was not a JSON object."])
                }
                let sessions = payload["sessions"] as? [[String: Any]] ?? []
                if payload["success"] as? Bool == false || sessions.isEmpty {
                    throw NSError(domain: "DentDriveUpload", code: 13, userInfo: [NSLocalizedDescriptionKey: "Upload-session response did not include usable sessions."])
                }
                completion(.success(payload))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }

    private func uploadUsingDirectSessions(endpoint: URL,
                                           folderName: String,
                                           preparedFiles: [PreparedUploadFile],
                                           sessionResponse: [String: Any],
                                           startedAt: Date,
                                           call: CAPPluginCall) {
        let descriptors = Self.parseUploadSessions(from: sessionResponse)
        let descriptorByIndex = Dictionary(uniqueKeysWithValues: descriptors.map { ($0.index, $0) })
        var directPairs: [(PreparedUploadFile, UploadSessionDescriptor)] = []
        var fallbackFiles: [PreparedUploadFile] = []

        for file in preparedFiles {
            if let descriptor = descriptorByIndex[file.index] {
                directPairs.append((file, descriptor))
            } else {
                fallbackFiles.append(file)
            }
        }

        if directPairs.isEmpty {
            performLegacyUpload(
                endpoint: endpoint,
                folderName: folderName,
                files: preparedFiles,
                startedAt: startedAt,
                transportLabel: "native-legacy",
                call: call
            )
            return
        }

        let group = DispatchGroup()
        let semaphore = DispatchSemaphore(value: driveUploadConcurrency)
        let mutationQueue = DispatchQueue(label: "DentDriveUpload.directMutation")
        var uploaded: [[String: Any]] = []
        var failedFiles: [PreparedUploadFile] = []

        for (file, descriptor) in directPairs {
            semaphore.wait()
            group.enter()

            uploadPreparedFile(file, to: descriptor.uploadURL) { result in
                mutationQueue.async {
                    switch result {
                    case .success(let payload):
                        uploaded.append(payload)
                    case .failure(let error):
                        os_log("Direct Drive upload failed for %{public}@; falling back. %{public}@",
                               log: driveUploadLog, type: .error, file.fileName, error.localizedDescription)
                        failedFiles.append(file)
                    }
                    semaphore.signal()
                    group.leave()
                }
            }
        }

        group.notify(queue: DispatchQueue.global(qos: .utility)) {
            let filesForLegacy = fallbackFiles + failedFiles
            if filesForLegacy.isEmpty {
                Self.cleanupEphemeralFiles(in: preparedFiles)
                self.resolveUploadResult(
                    call: call,
                    payload: [
                        "success": true,
                        "folderId": sessionResponse["folderId"] as? String ?? "",
                        "folderUrl": sessionResponse["folderUrl"] as? String ?? "",
                        "uploaded": uploaded,
                        "uploadedCount": uploaded.count,
                        "failed": [],
                        "failedCount": 0,
                        "transport": "native-direct"
                    ],
                    startedAt: startedAt
                )
                return
            }

            self.performLegacyUpload(
                endpoint: endpoint,
                folderName: folderName,
                files: filesForLegacy,
                startedAt: startedAt,
                transportLabel: "native-direct+legacy",
                seedPayload: [
                    "success": false,
                    "folderId": sessionResponse["folderId"] as? String ?? "",
                    "folderUrl": sessionResponse["folderUrl"] as? String ?? "",
                    "uploaded": uploaded,
                    "uploadedCount": uploaded.count,
                    "failed": [],
                    "failedCount": 0
                ],
                cleanupFiles: preparedFiles,
                call: call
            )
        }
    }

    private func performLegacyUpload(endpoint: URL,
                                     folderName: String,
                                     folderId: String = "",
                                     files: [PreparedUploadFile],
                                     startedAt: Date,
                                     transportLabel: String,
                                     seedPayload: [String: Any]? = nil,
                                     cleanupFiles: [PreparedUploadFile]? = nil,
                                     call: CAPPluginCall) {
        let normalizedFiles: [[String: Any]]
        do {
            normalizedFiles = try Self.buildLegacyUploadFiles(from: files)
        } catch {
            Self.cleanupEphemeralFiles(in: cleanupFiles ?? files)
            DispatchQueue.main.async {
                call.reject("Could not encode fallback upload payload: \(error.localizedDescription)")
            }
            return
        }

        let body: [String: Any] = [
            "action": "uploadBatch",
            "folderName": folderName,
            "folderId": folderId,
            "files": normalizedFiles
        ]

        let payload: Data
        do {
            payload = try JSONSerialization.data(withJSONObject: body, options: [])
        } catch {
            Self.cleanupEphemeralFiles(in: cleanupFiles ?? files)
            DispatchQueue.main.async {
                call.reject("Could not encode fallback upload payload: \(error.localizedDescription)")
            }
            return
        }

        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.httpBody = payload
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        session.dataTask(with: request) { data, response, error in
            Self.cleanupEphemeralFiles(in: cleanupFiles ?? files)

            if let error {
                os_log("Legacy native drive upload failed: %{public}@",
                       log: driveUploadLog, type: .error, error.localizedDescription)
                DispatchQueue.main.async {
                    call.reject("Upload failed: \(error.localizedDescription)")
                }
                return
            }

            guard let httpResponse = response as? HTTPURLResponse else {
                DispatchQueue.main.async {
                    call.reject("Upload failed: missing HTTP response.")
                }
                return
            }

            guard let data else {
                DispatchQueue.main.async {
                    call.reject("Upload failed: empty response body.")
                }
                return
            }

            let rawText = String(data: data, encoding: .utf8) ?? ""

            guard (200 ... 299).contains(httpResponse.statusCode) else {
                os_log("Legacy native drive upload HTTP %{public}d: %{public}@",
                       log: driveUploadLog, type: .error, httpResponse.statusCode, rawText)
                DispatchQueue.main.async {
                    call.reject("Upload failed with HTTP \(httpResponse.statusCode): \(rawText)")
                }
                return
            }

            do {
                let json = try JSONSerialization.jsonObject(with: data, options: [])
                var responsePayload = (json as? [String: Any]) ?? [:]
                if let seedPayload {
                    responsePayload = Self.mergeUploadPayloads(seedPayload, responsePayload)
                }
                responsePayload["transport"] = transportLabel
                self.resolveUploadResult(call: call, payload: responsePayload, startedAt: startedAt)
            } catch {
                os_log("Legacy native drive upload returned invalid JSON: %{public}@",
                       log: driveUploadLog, type: .error, rawText)
                DispatchQueue.main.async {
                    call.reject("Upload succeeded but returned invalid JSON.")
                }
            }
        }.resume()
    }

    private func uploadPreparedFile(_ file: PreparedUploadFile,
                                    to uploadURL: URL,
                                    completion: @escaping (Result<[String: Any], Error>) -> Void) {
        var request = URLRequest(url: uploadURL)
        request.httpMethod = "PUT"
        request.setValue(file.mimeType, forHTTPHeaderField: "Content-Type")
        request.setValue(String(file.fileSize), forHTTPHeaderField: "Content-Length")
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        session.uploadTask(with: request, fromFile: file.sourceURL) { data, response, error in
            if let error {
                completion(.failure(error))
                return
            }

            guard let httpResponse = response as? HTTPURLResponse else {
                completion(.failure(NSError(domain: "DentDriveUpload", code: 20, userInfo: [NSLocalizedDescriptionKey: "Missing Drive upload response for \(file.fileName)."])))
                return
            }

            guard (200 ... 299).contains(httpResponse.statusCode) else {
                let rawText = data.flatMap { String(data: $0, encoding: .utf8) } ?? ""
                completion(.failure(NSError(domain: "DentDriveUpload", code: httpResponse.statusCode, userInfo: [NSLocalizedDescriptionKey: "Drive upload failed for \(file.fileName) with HTTP \(httpResponse.statusCode): \(rawText)"])))
                return
            }

            guard let data else {
                completion(.failure(NSError(domain: "DentDriveUpload", code: 21, userInfo: [NSLocalizedDescriptionKey: "Drive upload returned no metadata for \(file.fileName)."])))
                return
            }

            do {
                let json = try JSONSerialization.jsonObject(with: data, options: [])
                var payload = (json as? [String: Any]) ?? [:]
                payload["fileName"] = payload["name"] as? String ?? file.fileName
                if payload["fileUrl"] == nil, let webViewLink = payload["webViewLink"] as? String {
                    payload["fileUrl"] = webViewLink
                }
                if payload["fileId"] == nil, let id = payload["id"] as? String {
                    payload["fileId"] = id
                }
                completion(.success(payload))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }

    private func resolveUploadResult(call: CAPPluginCall,
                                     payload: [String: Any],
                                     startedAt: Date) {
        var responsePayload = payload
        let durationMs = Int(Date().timeIntervalSince(startedAt) * 1000)
        responsePayload["durationMs"] = durationMs

        os_log("Native drive upload completed in %{public}dms",
               log: driveUploadLog, type: .debug, durationMs)

        DispatchQueue.main.async {
            call.resolve(responsePayload)
        }
    }

    private static func normalizeBase64Payload(_ value: String) -> String {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return "" }
        if let commaIndex = trimmed.firstIndex(of: ","),
           trimmed[..<commaIndex].contains("base64") {
            return String(trimmed[trimmed.index(after: commaIndex)...])
        }
        return trimmed
    }

    private static func ensureUploadRoot() throws -> URL {
        let root = try uploadRoot()
        try FileManager.default.createDirectory(at: root, withIntermediateDirectories: true, attributes: nil)
        return root
    }

    private static func uploadRoot() throws -> URL {
        guard let cachesURL = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask).first else {
            throw NSError(domain: "DentDriveUpload", code: 1, userInfo: [NSLocalizedDescriptionKey: "Caches directory is unavailable."])
        }
        return cachesURL.appendingPathComponent(tempFolderName, isDirectory: true)
    }

    private static func pruneStaleFiles() throws {
        let root = try ensureUploadRoot()
        let cutoff = Date().addingTimeInterval(-maxTempFileAge)
        let keys: [URLResourceKey] = [.isRegularFileKey, .contentModificationDateKey, .creationDateKey]
        let urls = try FileManager.default.contentsOfDirectory(at: root, includingPropertiesForKeys: keys, options: [.skipsHiddenFiles])
        for url in urls {
            let values = try url.resourceValues(forKeys: Set(keys))
            guard values.isRegularFile == true else { continue }
            let ageDate = values.contentModificationDate ?? values.creationDate ?? .distantPast
            if ageDate < cutoff {
                try? FileManager.default.removeItem(at: url)
            }
        }
    }

    private static func readLocalFile(at path: String) throws -> Data {
        let fileURL = URL(fileURLWithPath: path).standardizedFileURL
        let homePath = URL(fileURLWithPath: NSHomeDirectory(), isDirectory: true).standardizedFileURL.path
        guard fileURL.path.hasPrefix(homePath) else {
            throw NSError(domain: "DentDriveUpload", code: 2, userInfo: [NSLocalizedDescriptionKey: "File path is outside the app sandbox."])
        }
        return try Data(contentsOf: fileURL)
    }

    private static func prepareUploadFiles(from rawFiles: [[String: Any]]) throws -> [PreparedUploadFile] {
        var prepared: [PreparedUploadFile] = []
        prepared.reserveCapacity(rawFiles.count)

        for (index, rawFile) in rawFiles.enumerated() {
            let fallbackName = "photo_\(index + 1).jpg"
            let fileName = (rawFile["fileName"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines)
            let mimeType = (rawFile["mimeType"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines)
            let resolvedName = (fileName?.isEmpty == false ? fileName! : fallbackName)
            let resolvedMimeType = (mimeType?.isEmpty == false ? mimeType! : "image/jpeg")

            if let nativeFilePath = (rawFile["nativeFilePath"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines),
               !nativeFilePath.isEmpty {
                let fileURL = URL(fileURLWithPath: nativeFilePath).standardizedFileURL
                let data = try readLocalFile(at: nativeFilePath)
                prepared.append(PreparedUploadFile(
                    index: index,
                    fileName: resolvedName,
                    mimeType: resolvedMimeType,
                    sourceURL: fileURL,
                    fileSize: data.count,
                    cleanupAfterUpload: false,
                    base64Data: nil
                ))
                continue
            }

            let base64Raw = rawFile["base64Data"] as? String ?? ""
            let normalized = normalizeBase64Payload(base64Raw)
            if normalized.isEmpty {
                throw NSError(domain: "DentDriveUpload", code: 30, userInfo: [NSLocalizedDescriptionKey: "File \(index + 1) is missing upload data."])
            }

            guard let data = Data(base64Encoded: normalized, options: .ignoreUnknownCharacters),
                  !data.isEmpty else {
                throw NSError(domain: "DentDriveUpload", code: 31, userInfo: [NSLocalizedDescriptionKey: "File \(index + 1) base64 data is invalid."])
            }

            let tempURL = try writeEphemeralUploadFile(data: data, fileName: resolvedName, mimeType: resolvedMimeType)
            prepared.append(PreparedUploadFile(
                index: index,
                fileName: resolvedName,
                mimeType: resolvedMimeType,
                sourceURL: tempURL,
                fileSize: data.count,
                cleanupAfterUpload: true,
                base64Data: normalized
            ))
        }

        return prepared
    }

    private static func writeEphemeralUploadFile(data: Data, fileName: String, mimeType: String) throws -> URL {
        let rootURL = try ensureUploadRoot()
        let safeName = sanitizedFileName(fileName, mimeType: mimeType)
        let fileURL = rootURL.appendingPathComponent("\(UUID().uuidString)-\(safeName)")
        try data.write(to: fileURL, options: .atomic)
        return fileURL
    }

    private static func parseUploadSessions(from payload: [String: Any]) -> [UploadSessionDescriptor] {
        let rawSessions = payload["sessions"] as? [[String: Any]] ?? []
        return rawSessions.compactMap { session in
            let index = session["index"] as? Int ?? -1
            guard index >= 0,
                  let fileName = session["fileName"] as? String,
                  let uploadUrlText = session["uploadUrl"] as? String,
                  let uploadURL = URL(string: uploadUrlText) else {
                return nil
            }
            return UploadSessionDescriptor(index: index, fileName: fileName, uploadURL: uploadURL)
        }
    }

    private static func buildLegacyUploadFiles(from files: [PreparedUploadFile]) throws -> [[String: Any]] {
        try files.map { file in
            let base64Data: String
            if let stored = file.base64Data, !stored.isEmpty {
                base64Data = stored
            } else {
                let data = try Data(contentsOf: file.sourceURL)
                base64Data = data.base64EncodedString()
            }

            return [
                "fileName": file.fileName,
                "mimeType": file.mimeType,
                "base64Data": base64Data
            ]
        }
    }

    private static func mergeUploadPayloads(_ seedPayload: [String: Any], _ responsePayload: [String: Any]) -> [String: Any] {
        let leftUploaded = seedPayload["uploaded"] as? [[String: Any]] ?? []
        let rightUploaded = responsePayload["uploaded"] as? [[String: Any]] ?? []
        let leftFailed = seedPayload["failed"] as? [[String: Any]] ?? []
        let rightFailed = responsePayload["failed"] as? [[String: Any]] ?? []

        var merged = responsePayload
        merged["uploaded"] = leftUploaded + rightUploaded
        merged["failed"] = leftFailed + rightFailed
        merged["uploadedCount"] = (merged["uploaded"] as? [[String: Any]] ?? []).count
        merged["failedCount"] = (merged["failed"] as? [[String: Any]] ?? []).count
        merged["success"] = ((merged["failedCount"] as? Int) ?? 0) == 0
        if merged["folderId"] == nil {
            merged["folderId"] = seedPayload["folderId"]
        }
        if merged["folderUrl"] == nil {
            merged["folderUrl"] = seedPayload["folderUrl"]
        }
        return merged
    }

    private static func cleanupEphemeralFiles(in files: [PreparedUploadFile]) {
        for file in files where file.cleanupAfterUpload {
            try? FileManager.default.removeItem(at: file.sourceURL)
        }
    }

    private static func sanitizedFileName(_ fileName: String, mimeType: String) -> String {
        let invalid = CharacterSet(charactersIn: "/\\:?%*|\"<>\n\r")
        let pieces = fileName.components(separatedBy: invalid)
        let joined = pieces.joined(separator: "-").trimmingCharacters(in: .whitespacesAndNewlines)
        let fallbackExt = fileExtension(for: mimeType)
        let base = joined.isEmpty ? "photo.\(fallbackExt)" : joined
        if base.contains(".") {
            return base
        }
        return "\(base).\(fallbackExt)"
    }

    private static func fileExtension(for mimeType: String) -> String {
        let lower = mimeType.lowercased()
        if lower.contains("png") { return "png" }
        if lower.contains("webp") { return "webp" }
        if lower.contains("pdf") { return "pdf" }
        return "jpg"
    }
}
