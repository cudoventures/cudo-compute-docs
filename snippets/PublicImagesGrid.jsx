
export const PublicImagesGrid = () => {

    const getOsImageIcon = (id) => {
        if (/stability/.test(id))
            return '/docs/images/osImages/stability-ai.svg'

        const index = id.search('-')
        const brand = index > 0 ? id.substring(0, index) : id
        if (brand !== 'cudo') {
            switch (brand) {
                case 'alpine':
                    return '/docs/images/osImages/alpine-linux.png'
                case 'amazon':
                    return '/docs/images/osImages/amazon-linux.png'
                case 'centos':
                    return '/docs/images/osImages/centos.svg'
                case 'debian':
                    return '/docs/images/osImages/debian.svg'
                case 'devuan':
                    return '/docs/images/osImages/devuan.png'
                case 'fedora':
                    return '/docs/images/osImages/fedora.png'
                // todo: this id should be hyphonated in db
                case 'fedora36':
                    return '/docs/images/osImages/fedora.png'
                case 'freebsd':
                    return '/docs/images/osImages/freebsd.svg'
                case 'gitlab':
                    return '/docs/images/osImages/gitlab.svg'
                case 'hive':
                    return '/docs/images/osImages/hive.png'
                case 'opensuse':
                    return '/docs/images/osImages/open-suse.png'
                case 'oracle':
                    return '/docs/images/osImages/oracle.svg'
                case 'rocky':
                    return '/docs/images/osImages/rocky-linux.png'
                case 'service':
                    return '/docs/images/osImages/wordpress.png'
                case 'ubuntu':
                    return '/docs/images/osImages/ubuntu.svg'
                case 'windows':
                    return '/docs/images/osImages/windows.svg'
            }
        }
        else {
            switch (id) {
                case 'cudo-ubuntu2004-docker':
                    return '/docs/images/osImages/docker.png'
                case 'cudo-ubuntu2004-blender':
                    return '/docs/images/osImages/blender.png'
                case 'cudo-tensorflow-docker-gpu':
                    return '/docs/images/osImages/tensorflow.svg'
                case 'cudo-ubuntu-nvidia':
                    return '/docs/images/osImages/nvidia.svg'
                case 'cudo-ubuntu-focal':
                    return '/docs/images/osImages/ubuntu.svg'
                default:
                    return '/logo-mark-black.svg'
            }
        }
    }


    const publicImages = [
        { id: 'alpine-linux-319', name: 'Alpine Linux 3.19', description: 'Security-oriented, lightweight Linux distribution based on musl libc and busybox', displayName: '', platform: 'linux', sizeGib: 1, installedPackages: [] },
        { id: 'centos-7', name: 'CentOS 7', description: 'CentOS 7', displayName: '', platform: 'linux', sizeGib: 8, installedPackages: [] },
        { id: 'centos-8-stream', name: 'CentOS 8 Stream', description: 'CentOS 8 Stream', displayName: '', platform: 'linux', sizeGib: 10, installedPackages: [] },
        { id: 'debian-11', name: 'Debian 11', description: 'Debian GNU/Linux 11 (bullseye)', displayName: '', platform: 'linux', sizeGib: 2, installedPackages: [] },
        { id: 'debian-12', name: 'Debian 12', description: 'Debian GNU/Linux 12 (bookworm)', displayName: '', platform: 'linux', sizeGib: 2, installedPackages: [] },
        { id: 'fedora-37', name: 'Fedora 37', description: 'Fedora 37', displayName: '', platform: 'linux', sizeGib: 20, installedPackages: [] },
        { id: 'freebsd-13', name: 'FreeBSD 13', description: 'FreeBSD 13', displayName: '', platform: 'linux', sizeGib: 4, installedPackages: [] },
        { id: 'opensuse-15', name: 'openSUSE 15', description: 'openSUSE 15', displayName: '', platform: 'linux', sizeGib: 10, installedPackages: [] },
        { id: 'rocky-linux-9', name: 'Rocky Linux 9', description: 'Rocky Linux 9.1', displayName: '', platform: 'linux', sizeGib: 10, installedPackages: [] },
        { id: 'ubuntu-2004', name: 'Ubuntu 20.04', description: 'Ubuntu 20.04 LTS (focal)', displayName: '', platform: 'linux', sizeGib: 4, installedPackages: [] },
        { id: 'ubuntu-2204', name: 'Ubuntu 22.04', description: 'Ubuntu 22.04 LTS (jammy)', displayName: '', platform: 'linux', sizeGib: 4, installedPackages: [] },
        { id: 'ubuntu-2204-nvidia-535-docker-v20241017', name: 'Ubuntu 22.04 + NVIDIA v535 drivers + Docker', description: 'Ubuntu 22.04 with NVIDIA drivers and Docker preinstalled', displayName: '', platform: 'linux', sizeGib: 10, installedPackages: [] },
        { id: 'ubuntu-2204-nvidia-550-docker-v20250303', name: 'Ubuntu 22.04 + NVIDIA v550 drivers + Docker', description: 'Ubuntu 22.04 with NVIDIA drivers and Docker preinstalled', displayName: '', platform: 'linux', sizeGib: 10, installedPackages: [] },
        { id: 'ubuntu-2404', name: 'Ubuntu 24.04', description: 'Ubuntu 24.04 LTS (noble)', displayName: '', platform: 'linux', sizeGib: 4, installedPackages: [] },
        { id: 'windows-10-pro', name: 'Windows 10 Pro', description: 'Windows 10 Pro', displayName: '', platform: 'windows', sizeGib: 50, installedPackages: [] },
        { id: 'windows-11-pro', name: 'Windows 11 Pro', description: 'Windows 11 Pro', displayName: '', platform: 'windows', sizeGib: 50, installedPackages: [] },
    ]

    return (
        <table>
            <thead>
                <tr>
                    <th style={{ textAlign: "left" }}>Name</th>
                    <th style={{ textAlign: "right" }}>Size</th>
                </tr>
            </thead>
            <tbody>
                {publicImages.map(img => (
                    <tr key={img.id}>
                        <td>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Icon icon={getOsImageIcon(img.id)} color="transparent" size={18} alt={img.name} />
                                <span>{img.name}</span>
                                <code style={{ background: 'none', fontSize: '0.75rem' }}>{img.id}</code>
                            </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>{img.sizeGib} GB</td>
                    </tr>
                ))}
            </tbody>
        </table >
    );
}

