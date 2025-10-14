
export const CliToolTable = () => {

    const getOsImageIcon = (id) => {
        const index = id.search('-')
        const brand = index > 0 ? id.substring(0, index) : id
        if (brand !== 'cudo') {
            switch (brand) {
                case 'macos':
                    return '/mdocs/images/osImages/macos.svg'
                case 'debian':
                    return '/mdocs/images/osImages/debian.svg'
                case 'redhat':
                    return '/mdocs/images/osImages/redhat.svg'
                case 'linux':
                    return '/mdocs/images/osImages/linux.svg'
                case 'windows':
                    return '/mdocs/images/osImages/windows.svg'
            }
        }
        else {
            switch (id) {
                case 'cudo-ubuntu2004-docker':
                    return '/mdocs/images/osImages/docker.png'
                case 'cudo-ubuntu2004-blender':
                    return '/mdocs/images/osImages/blender.png'
                case 'cudo-tensorflow-docker-gpu':
                    return '/mdocs/images/osImages/tensorflow.svg'
                case 'cudo-ubuntu-nvidia':
                    return '/mdocs/images/osImages/nvidia.svg'
                case 'cudo-ubuntu-focal':
                    return '/mdocs/images/osImages/ubuntu.svg'
                default:
                    return '/logo-mark-black.svg'
            }
        }
    }



    const cliBinaries = [
        { id: 'macos-amd64', name: 'macOS - amd64', platform: 'darwin', url: 'https://download.cudocompute.com/cli/cudoctl_darwin_amd64' },
        { id: 'macos-arm64', name: 'macOS - arm64', platform: 'darwin', url: 'https://download.cudocompute.com/cli/cudoctl_darwin_arm64' },
        { id: 'macos-universal', name: 'macOS - Universal', platform: 'darwin', url: 'https://download.cudocompute.com/cli/cudoctl_darwin_all' },
        { id: 'debian-amd64', name: 'Debian - amd64', platform: 'debian', url: 'https://download.cudocompute.com/cli/cudoctl-amd64.deb' },
        { id: 'debian-arm64', name: 'Debian - arm64', platform: 'debian', url: 'https://download.cudocompute.com/cli/cudoctl-arm64.deb' },
        { id: 'redhat-amd64', name: 'RedHat (RPM) - amd64', platform: 'redhat', url: 'https://download.cudocompute.com/cli/cudoctl-amd64.rpm' },
        { id: 'redhat-arm64', name: 'RedHat (RPM) - arm64', platform: 'redhat', url: 'https://download.cudocompute.com/cli/cudoctl-arm64.rpm' },
        { id: 'linux-amd64', name: 'Other Linux - amd64', platform: 'linux', url: 'https://download.cudocompute.com/cli/cudoctl_linux_amd64.tar.gz' },
        { id: 'linux-arm64', name: 'Other Linux - arm64', platform: 'linux', url: 'https://download.cudocompute.com/cli/cudoctl_linux_arm64.tar.gz' },
        { id: 'windows-amd64', name: 'Windows', platform: 'windows', url: 'https://download.cudocompute.com/cli/cudoctl_windows_amd64.zip' },
    ]

    return (
        <Columns cols={3}>
            {cliBinaries.map(bin => (
                <Card
                    key={bin.id}
                    href={bin.url}

                >
                    <Icon icon={getOsImageIcon(bin.id)} size={18} color="transparent" alt={bin.name} />
                    <span style={{ marginLeft: '.4rem', fontSize: '0.8rem', fontWeight: 'bold' }}>{bin.name}</span>
                </Card>
            ))}
        </Columns>
    );
}

