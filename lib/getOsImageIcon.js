export const getOsImageIcon = (id) => {
    if (/stability/.test(id))
        return '/docs/osImages/stability-ai.svg'

    const index = id.search('-')
    const brand = index > 0 ? id.substring(0, index) : id
    if (brand !== 'cudo') {
        switch (brand) {
            case 'alpine':
                return '/docs/osImages/alpine-linux.png'
            case 'amazon':
                return '/docs/osImages/amazon-linux.png'
            case 'centos':
                return '/docs/osImages/centos.svg'
            case 'debian':
                return '/docs/osImages/debian.svg'
            case 'devuan':
                return '/docs/osImages/devuan.png'
            case 'fedora':
                return '/docs/osImages/fedora.png'
            // todo: this id should be hyphonated in db
            case 'fedora36':
                return '/docs/osImages/fedora.png'
            case 'freebsd':
                return '/docs/osImages/freebsd.svg'
            case 'gitlab':
                return '/docs/osImages/gitlab.svg'
            case 'hive':
                return '/docs/osImages/hive.png'
            case 'opensuse':
                return '/docs/osImages/open-suse.png'
            case 'oracle':
                return '/docs/osImages/oracle.svg'
            case 'rocky':
                return '/docs/osImages/rocky-linux.png'
            case 'service':
                return '/docs/osImages/wordpress.png'
            case 'ubuntu':
                return '/docs/osImages/ubuntu.svg'
            case 'windows':
                return '/docs/osImages/windows.svg'
        }
    }
    else {
        switch (id) {
            case 'cudo-ubuntu2004-docker':
                return '/docs/osImages/docker.png'
            case 'cudo-ubuntu2004-blender':
                return '/docs/osImages/blender.png'
            case 'cudo-tensorflow-docker-gpu':
                return '/docs/osImages/tensorflow.svg'
            case 'cudo-ubuntu-nvidia':
                return '/docs/osImages/nvidia.svg'
            case 'cudo-ubuntu-focal':
                return '/docs/osImages/ubuntu.svg'
            default:
                return '/logo-mark-black.svg'
        }
    }
}
