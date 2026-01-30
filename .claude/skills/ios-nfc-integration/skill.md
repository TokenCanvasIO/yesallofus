# iOS NFC Integration Skill

Core NFC patterns for YesAllOfUs iOS app - reading NFC cards for staff authentication.

## Info.plist Requirements

```xml
<key>NFCReaderUsageDescription</key>
<string>YesAllOfUs uses NFC to read staff cards for authentication</string>
<key>com.apple.developer.nfc.readersession.iso7816.select-identifiers</key>
<array>
    <string>D2760000850101</string>
</array>
<key>com.apple.developer.nfc.readersession.felica.systemcodes</key>
<array>
    <string>0000</string>
</array>
```

## Entitlements

```xml
<key>com.apple.developer.nfc.readersession.formats</key>
<array>
    <string>TAG</string>
    <string>NDEF</string>
</array>
```

## NFC Manager

```swift
import CoreNFC
import Combine

// MARK: - NFC Error Types
enum NFCError: LocalizedError {
    case notSupported
    case sessionInvalidated(String)
    case readFailed(String)
    case noTagFound
    case tagNotNDEF
    case emptyTag
    case invalidCardData

    var errorDescription: String? {
        switch self {
        case .notSupported:
            return "NFC is not supported on this device"
        case .sessionInvalidated(let reason):
            return "NFC session ended: \(reason)"
        case .readFailed(let reason):
            return "Failed to read NFC tag: \(reason)"
        case .noTagFound:
            return "No NFC tag detected"
        case .tagNotNDEF:
            return "Tag is not NDEF formatted"
        case .emptyTag:
            return "NFC tag is empty"
        case .invalidCardData:
            return "Invalid staff card data"
        }
    }
}

// MARK: - NFC Read Result
struct NFCReadResult {
    let cardId: String
    let payload: String?
    let tagType: String
}

// MARK: - NFC Manager
@Observable
final class NFCManager: NSObject {
    private var session: NFCNDEFReaderSession?
    private var continuation: CheckedContinuation<NFCReadResult, Error>?

    var isReading: Bool = false
    var lastError: NFCError?

    // Check if NFC is available
    static var isSupported: Bool {
        NFCNDEFReaderSession.readingAvailable
    }

    // Read NFC tag with async/await
    func readTag() async throws -> NFCReadResult {
        guard Self.isSupported else {
            throw NFCError.notSupported
        }

        return try await withCheckedThrowingContinuation { continuation in
            self.continuation = continuation
            self.isReading = true
            self.lastError = nil

            session = NFCNDEFReaderSession(
                delegate: self,
                queue: .main,
                invalidateAfterFirstRead: true
            )
            session?.alertMessage = "Hold your staff card near the phone"
            session?.begin()
        }
    }

    // Cancel current session
    func cancelSession() {
        session?.invalidate()
        session = nil
        isReading = false
    }

    // Parse staff card ID from NDEF payload
    private func parseStaffCardId(from records: [NFCNDEFPayload]) -> NFCReadResult? {
        for record in records {
            // Check for URI record (our cards use URI format)
            if record.typeNameFormat == .nfcWellKnown,
               let type = String(data: record.type, encoding: .utf8),
               type == "U" {
                // URI record - payload starts with protocol byte
                let payload = record.payload
                guard payload.count > 1 else { continue }

                // Skip protocol byte and decode
                let uriData = payload.dropFirst()
                if let uri = String(data: Data(uriData), encoding: .utf8) {
                    // Extract card ID from URI (format: yesallofus://card/CARD_ID)
                    if let cardId = extractCardId(from: uri) {
                        return NFCReadResult(
                            cardId: cardId,
                            payload: uri,
                            tagType: "URI"
                        )
                    }
                }
            }

            // Check for text record
            if record.typeNameFormat == .nfcWellKnown,
               let type = String(data: record.type, encoding: .utf8),
               type == "T" {
                let payload = record.payload
                guard payload.count > 1 else { continue }

                // Text record format: status byte + language code + text
                let statusByte = payload[0]
                let languageCodeLength = Int(statusByte & 0x3F)
                let textStart = 1 + languageCodeLength

                guard payload.count > textStart else { continue }

                let textData = payload.dropFirst(textStart)
                if let text = String(data: Data(textData), encoding: .utf8) {
                    // Card ID might be directly in text
                    return NFCReadResult(
                        cardId: text,
                        payload: text,
                        tagType: "Text"
                    )
                }
            }
        }
        return nil
    }

    // Extract card ID from URI
    private func extractCardId(from uri: String) -> String? {
        // Format: yesallofus://card/CARD_ID or just the card ID
        if uri.hasPrefix("yesallofus://card/") {
            return String(uri.dropFirst("yesallofus://card/".count))
        }
        // If no prefix, treat entire string as card ID
        return uri.isEmpty ? nil : uri
    }
}

// MARK: - NFCNDEFReaderSessionDelegate
extension NFCManager: NFCNDEFReaderSessionDelegate {
    func readerSession(_ session: NFCNDEFReaderSession, didInvalidateWithError error: Error) {
        DispatchQueue.main.async { [weak self] in
            self?.isReading = false
            self?.session = nil

            let nfcError = error as? NFCReaderError

            // User cancelled - don't report as error
            if nfcError?.code == .readerSessionInvalidationErrorUserCanceled {
                self?.continuation?.resume(throwing: NFCError.sessionInvalidated("Cancelled"))
                self?.continuation = nil
                return
            }

            // First NDEF tag read - this is success, handled in didDetectNDEFs
            if nfcError?.code == .readerSessionInvalidationErrorFirstNDEFTagRead {
                return
            }

            // Other errors
            let errorMessage = error.localizedDescription
            self?.lastError = .sessionInvalidated(errorMessage)
            self?.continuation?.resume(throwing: NFCError.sessionInvalidated(errorMessage))
            self?.continuation = nil
        }
    }

    func readerSession(_ session: NFCNDEFReaderSession, didDetectNDEFs messages: [NFCNDEFMessage]) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }

            self.isReading = false

            // Find valid staff card data
            for message in messages {
                if let result = self.parseStaffCardId(from: message.records) {
                    self.continuation?.resume(returning: result)
                    self.continuation = nil
                    return
                }
            }

            // No valid card data found
            self.lastError = .invalidCardData
            self.continuation?.resume(throwing: NFCError.invalidCardData)
            self.continuation = nil
        }
    }

    func readerSessionDidBecomeActive(_ session: NFCNDEFReaderSession) {
        // Session is active, waiting for tag
    }
}
```

## NFC Reading View

```swift
import SwiftUI

struct NFCReadingView: View {
    let onCardRead: (String) -> Void
    let onCancel: () -> Void

    @State private var nfcManager = NFCManager()
    @State private var isAnimating = false
    @State private var errorMessage: String?

    var body: some View {
        VStack(spacing: Theme.Spacing.xl) {
            Spacer()

            // NFC Animation
            NFCAnimationView(isAnimating: $isAnimating)
                .frame(width: 200, height: 200)

            Text("Tap Staff Card")
                .font(Theme.Typography.title2)
                .foregroundStyle(Theme.Colors.text)

            Text("Hold the NFC card near the top of your iPhone")
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            if let error = errorMessage {
                Text(error)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.error)
                    .padding()
                    .background(Theme.Colors.error.opacity(0.1))
                    .cornerRadius(Theme.CornerRadius.medium)
            }

            Spacer()

            // Cancel button
            SecondaryButton(title: "Cancel", action: onCancel)
                .padding(.horizontal)
                .padding(.bottom, Theme.Spacing.xl)
        }
        .background(Theme.Colors.background)
        .task {
            await startReading()
        }
        .onDisappear {
            nfcManager.cancelSession()
        }
    }

    private func startReading() async {
        guard NFCManager.isSupported else {
            errorMessage = "NFC is not supported on this device"
            return
        }

        isAnimating = true
        errorMessage = nil

        do {
            let result = try await nfcManager.readTag()
            isAnimating = false
            HapticManager.shared.success()
            onCardRead(result.cardId)
        } catch let error as NFCError {
            isAnimating = false

            // Don't show error for user cancellation
            if case .sessionInvalidated("Cancelled") = error {
                onCancel()
                return
            }

            HapticManager.shared.error()
            errorMessage = error.localizedDescription

            // Auto-retry after delay
            try? await Task.sleep(nanoseconds: 2_000_000_000)
            await startReading()
        } catch {
            isAnimating = false
            HapticManager.shared.error()
            errorMessage = error.localizedDescription
        }
    }
}

// MARK: - NFC Animation View
struct NFCAnimationView: View {
    @Binding var isAnimating: Bool

    @State private var waveScale1: CGFloat = 1.0
    @State private var waveScale2: CGFloat = 1.0
    @State private var waveScale3: CGFloat = 1.0
    @State private var waveOpacity1: Double = 0.6
    @State private var waveOpacity2: Double = 0.4
    @State private var waveOpacity3: Double = 0.2

    var body: some View {
        ZStack {
            // Waves
            Circle()
                .stroke(Theme.Colors.primary, lineWidth: 2)
                .scaleEffect(waveScale3)
                .opacity(waveOpacity3)

            Circle()
                .stroke(Theme.Colors.primary, lineWidth: 2)
                .scaleEffect(waveScale2)
                .opacity(waveOpacity2)

            Circle()
                .stroke(Theme.Colors.primary, lineWidth: 3)
                .scaleEffect(waveScale1)
                .opacity(waveOpacity1)

            // Center icon
            Image(systemName: "wave.3.right")
                .font(.system(size: 50, weight: .medium))
                .foregroundStyle(Theme.Colors.primary)
                .rotationEffect(.degrees(-45))
        }
        .onChange(of: isAnimating) { _, newValue in
            if newValue {
                startAnimation()
            } else {
                stopAnimation()
            }
        }
        .onAppear {
            if isAnimating {
                startAnimation()
            }
        }
    }

    private func startAnimation() {
        withAnimation(.easeOut(duration: 1.5).repeatForever(autoreverses: false)) {
            waveScale1 = 1.5
            waveOpacity1 = 0
        }

        withAnimation(.easeOut(duration: 1.5).repeatForever(autoreverses: false).delay(0.3)) {
            waveScale2 = 1.5
            waveOpacity2 = 0
        }

        withAnimation(.easeOut(duration: 1.5).repeatForever(autoreverses: false).delay(0.6)) {
            waveScale3 = 1.5
            waveOpacity3 = 0
        }
    }

    private func stopAnimation() {
        waveScale1 = 1.0
        waveScale2 = 1.0
        waveScale3 = 1.0
        waveOpacity1 = 0.6
        waveOpacity2 = 0.4
        waveOpacity3 = 0.2
    }
}
```

## Staff Clock-In Flow

```swift
import SwiftUI

struct StaffClockInView: View {
    @Environment(\.dismiss) private var dismiss

    let storeId: String
    let apiClient: APIClient
    let onClockIn: (Staff) -> Void

    @State private var isProcessing = false
    @State private var error: String?
    @State private var clockedInStaff: Staff?

    var body: some View {
        NavigationStack {
            Group {
                if let staff = clockedInStaff {
                    // Success state
                    VStack(spacing: Theme.Spacing.lg) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 80))
                            .foregroundStyle(Theme.Colors.success)

                        Text("Welcome, \(staff.name)!")
                            .font(Theme.Typography.title)

                        Text("You're now clocked in")
                            .font(Theme.Typography.body)
                            .foregroundStyle(Theme.Colors.textSecondary)

                        PrimaryButton(title: "Start Selling") {
                            onClockIn(staff)
                            dismiss()
                        }
                        .padding(.top, Theme.Spacing.xl)
                    }
                    .padding()
                } else if isProcessing {
                    // Processing state
                    VStack(spacing: Theme.Spacing.lg) {
                        ProgressView()
                            .scaleEffect(1.5)
                        Text("Verifying card...")
                            .font(Theme.Typography.body)
                            .foregroundStyle(Theme.Colors.textSecondary)
                    }
                } else {
                    // NFC reading state
                    NFCReadingView(
                        onCardRead: { cardId in
                            Task {
                                await authenticateCard(cardId)
                            }
                        },
                        onCancel: {
                            dismiss()
                        }
                    )
                }
            }
            .navigationTitle("Staff Clock In")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
            .alert("Error", isPresented: .constant(error != nil)) {
                Button("Try Again") {
                    error = nil
                }
                Button("Cancel", role: .cancel) {
                    dismiss()
                }
            } message: {
                if let error = error {
                    Text(error)
                }
            }
        }
    }

    private func authenticateCard(_ cardId: String) async {
        isProcessing = true
        error = nil

        do {
            // Authenticate with API
            let response = try await apiClient.authenticateNFCCard(
                storeId: storeId,
                cardId: cardId
            )

            if response.success, let staffData = response.staff {
                let staff = StaffMapper.map(staffData)
                clockedInStaff = staff
                HapticManager.shared.success()
            } else {
                error = response.message ?? "Card not recognized"
                HapticManager.shared.error()
            }
        } catch {
            self.error = error.localizedDescription
            HapticManager.shared.error()
        }

        isProcessing = false
    }
}
```

## Device Capability Check

```swift
import SwiftUI

struct NFCCapabilityBanner: View {
    var body: some View {
        if !NFCManager.isSupported {
            HStack {
                Image(systemName: "exclamationmark.triangle.fill")
                    .foregroundStyle(Theme.Colors.warning)

                Text("NFC not available on this device")
                    .font(Theme.Typography.caption)

                Spacer()
            }
            .padding()
            .background(Theme.Colors.warning.opacity(0.1))
            .cornerRadius(Theme.CornerRadius.medium)
        }
    }
}

// Use in settings or setup screens
struct StoreSettingsView: View {
    var body: some View {
        Form {
            Section("Staff Authentication") {
                NFCCapabilityBanner()

                if NFCManager.isSupported {
                    NavigationLink("Manage NFC Cards") {
                        NFCCardManagementView()
                    }
                } else {
                    Text("Use PIN codes for staff authentication on this device")
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.textSecondary)
                }
            }
        }
    }
}
```

## Testing in Simulator

NFC is not available in the iOS Simulator. Use these patterns for development:

```swift
#if DEBUG
extension NFCManager {
    // Mock read for simulator testing
    static func mockRead(cardId: String = "TEST_CARD_001") async -> NFCReadResult {
        // Simulate delay
        try? await Task.sleep(nanoseconds: 1_500_000_000)
        return NFCReadResult(
            cardId: cardId,
            payload: "yesallofus://card/\(cardId)",
            tagType: "Mock"
        )
    }
}

// Preview helper
struct NFCReadingView_Previews: PreviewProvider {
    static var previews: some View {
        NFCReadingView(
            onCardRead: { cardId in
                print("Read card: \(cardId)")
            },
            onCancel: {}
        )
    }
}
#endif
```

## Usage Pattern

```swift
// In ViewModel
@Observable
final class POSViewModel {
    var showNFCClockIn = false
    var currentStaff: Staff?

    private let nfcManager = NFCManager()
    private let apiClient: APIClient

    func clockInWithNFC() {
        guard NFCManager.isSupported else {
            // Fall back to PIN entry
            showPINEntry = true
            return
        }
        showNFCClockIn = true
    }

    func handleClockIn(_ staff: Staff) {
        currentStaff = staff
        showNFCClockIn = false
    }
}

// In View
struct POSView: View {
    @State private var viewModel: POSViewModel

    var body: some View {
        // ... POS content ...
        .sheet(isPresented: $viewModel.showNFCClockIn) {
            StaffClockInView(
                storeId: viewModel.storeId,
                apiClient: viewModel.apiClient,
                onClockIn: viewModel.handleClockIn
            )
        }
    }
}
```
