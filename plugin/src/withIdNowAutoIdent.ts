import {withDangerousMod, withEntitlementsPlist, withInfoPlist, withXcodeProject} from "@expo/config-plugins";
import path from "node:path";
import fs from "node:fs";
import {ExpoConfig} from "@expo/config-types";

const frameworks = [
    'FaceTecSDK.xcframework',
    'IDNowSDKCore.xcframework',
    'ReadID_UI.xcframework',
    'ReadID.xcframework',
]

const withIdNowAutoIdent = (config: ExpoConfig) => {
    config = withEntitlementsPlist(config, config => {
        config.modResults['com.apple.developer.nfc.readersession.formats'] = ['NDEF', 'TAG']
        return config
    })

    config = withInfoPlist(config, config => {
        config.modResults['com.apple.developer.nfc.readersession.iso7816.select-identifiers'] = [
            'A0000002471001',
            'A00000045645444C2D3031',
        ]
        config.modResults.NFCReaderUsageDescription = 'We need to access NFC to read your ID document'
        return config
    })

    config = withDangerousMod(config, [
        'ios',
        async config => {
            const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile')
            let podfileContent = fs.readFileSync(podfilePath, 'utf-8')

            const idnowConfig = `
    # Add IDNow frameworks to RNIdNowLibrary target
    frameworks_path = File.join(Pod::Config.instance.installation_root, '..', 'node_modules/@idnow/react-autoident/ios/Frameworks')
    frameworks = [
      'FaceTecSDK.xcframework',
      'IDNowSDKCore.xcframework',
      'ReadID_UI.xcframework',
      'ReadID.xcframework'
    ]

    idnow_target = installer.pods_project.targets.find { |target| target.name == 'RNIdNowLibrary' }
    if idnow_target
      idnow_target.build_configurations.each do |config|
        config.build_settings['FRAMEWORK_SEARCH_PATHS'] ||= ['$(inherited)']
        config.build_settings['FRAMEWORK_SEARCH_PATHS'] << frameworks_path.to_s

        frameworks.each do |framework|
          framework_path = File.join(frameworks_path, framework)
          if File.exist?(framework_path)
            idnow_target.frameworks_build_phase.add_file_reference(
              installer.pods_project.new_file(framework_path)
            )
          else
            puts "[WARNING] Framework not found: \#{framework_path}"
          end
        end
      end
    else
      puts "[WARNING] RNIdNowLibrary target not found"
    end`

            const postInstallRegex =
                /(post_install do \|installer\|[\s\S]*?CODE_SIGNING_ALLOWED.*?=.*?'NO'[\s\S]*?end[\s\S]*?end[\s\S]*?end)/
            const match = podfileContent.match(postInstallRegex)

            if (match) {
                const [fullMatch] = match
                podfileContent = podfileContent.replace(fullMatch, `${fullMatch}${idnowConfig}`)
            }

            fs.writeFileSync(podfilePath, podfileContent)
            return config
        },
    ])

    return withXcodeProject(config, config => {
        const xcodeProject = config.modResults
        const projectRoot = config.modRequest.projectRoot
        const frameworksPath = path.join(
            projectRoot,
            'node_modules/@idnow/react-autoident/ios/Frameworks',
        )

        if (!fs.existsSync(frameworksPath)) {
            console.warn('IDNow frameworks path not found:', frameworksPath)
            return config
        }

        const frameworksGroup =
            xcodeProject.pbxGroupByName('Frameworks') || xcodeProject.addPbxGroup([], 'Frameworks')

        const targets = xcodeProject.getFirstTarget()
        if (!targets) {
            console.warn('No targets found in Xcode project')
            return config
        }

        const proj = xcodeProject.getFirstProject()
        const mainTargetUuid = targets.uuid
        const projSection = xcodeProject.pbxProjectSection()[proj.uuid]
        const targetAttributes = projSection.attributes.TargetAttributes[mainTargetUuid]

        if (!targetAttributes.SystemCapabilities) {
            targetAttributes.SystemCapabilities = {}
        }
        targetAttributes.SystemCapabilities['com.apple.NearFieldCommunicationTagReading'] = {enabled: 1}

        const buildConfig = xcodeProject.pbxXCBuildConfigurationSection()
        Object.keys(buildConfig)
            .filter(key => !key.endsWith('_comment'))
            .forEach(key => {
                const config = buildConfig[key]
                if (config.buildSettings) {
                    const entitlementsFilename = `${
                        config.modRequest?.projectName || 'wu-mobile'
                    }.entitlements`
                    config.buildSettings.CODE_SIGN_ENTITLEMENTS = entitlementsFilename
                }
            })

        const nativeTarget = xcodeProject.pbxNativeTargetSection()[mainTargetUuid]

        const buildPhases = xcodeProject.hash.project.objects.PBXCopyFilesBuildPhase || {}
        let embedFrameworksBuildPhase = Object.keys(buildPhases)
            .filter(key => !key.endsWith('_comment'))
            .find(key => {
                const phase = buildPhases[key]
                return phase.name === 'Embed Frameworks' && phase.dstSubfolderSpec === 10
            })

        if (!embedFrameworksBuildPhase) {
            const buildPhaseResult = xcodeProject.addBuildPhase(
                [],
                'PBXCopyFilesBuildPhase',
                'Embed Frameworks',
                mainTargetUuid,
                'frameworks',
            )
            embedFrameworksBuildPhase = buildPhaseResult.uuid
            const phase = buildPhases[embedFrameworksBuildPhase!]
            if (phase) {
                phase.dstPath = ''
                phase.dstSubfolderSpec = 10
                phase.buildActionMask = 2147483647
                phase.runOnlyForDeploymentPostprocessing = 0
                phase.files = []
            }
        }

        frameworks.forEach(framework => {
            const frameworkPath = path.join(frameworksPath, framework)
            if (!fs.existsSync(frameworkPath)) {
                console.warn(`Framework not found: ${frameworkPath}`)
                return
            }

            const file = xcodeProject.addFramework(frameworkPath, {
                customFramework: true,
                target: mainTargetUuid,
                link: true,
                sign: true,
                embed: true,
                sourceTree: 'SOURCE_ROOT',
            })

            if (frameworksGroup) {
                frameworksGroup.children.push({
                    value: file.fileRef,
                    comment: framework,
                })
            }

            const embedFile = {
                value: file.uuid,
                comment: framework,
            }

            const phase = buildPhases[embedFrameworksBuildPhase!]
            if (phase?.files) {
                const existingFile = phase.files.find((f: any) => f.comment === framework)
                if (!existingFile) {
                    phase.files.push(embedFile)
                }
            }

            const settings = xcodeProject.hash.project.objects.PBXBuildFile[file.uuid]
            if (settings) {
                settings.settings = settings.settings || {}
                settings.settings.ATTRIBUTES = ['CodeSignOnCopy', 'RemoveHeadersOnCopy']
            }
        })

        const configurations = xcodeProject.pbxXCBuildConfigurationSection()
        Object.keys(configurations)
            .filter(key => !key.endsWith('_comment'))
            .forEach(key => {
                const configuration = configurations[key]
                if (configuration.buildSettings) {
                    const settings = configuration.buildSettings

                    settings.FRAMEWORK_SEARCH_PATHS = [`"$(inherited)"`, `"${frameworksPath}"`]
                    settings.LD_RUNPATH_SEARCH_PATHS = `"$(inherited) @executable_path/Frameworks"`
                    settings.ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES = 'YES'
                    settings.ENABLE_BITCODE = 'NO'

                    const isDebug = false
                    const arch = isDebug ? 'ios-arm64_x86_64-simulator' : 'ios-arm64'

                    const headerSearchPaths = frameworks.map(framework => {
                        const headerPath = path.join(
                            frameworksPath,
                            framework,
                            arch,
                            framework.replace('.xcframework', '.framework'),
                            'Headers',
                        )
                        return `"${headerPath}"`
                    })

                    settings.HEADER_SEARCH_PATHS = [`"$(inherited)"`, ...headerSearchPaths]
                }
            })

        return config
    })
}

export default withIdNowAutoIdent;
