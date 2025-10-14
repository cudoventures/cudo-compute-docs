export const getOsImageIcon = (id) => {
    if (/stability/.test(id))
        return '/mdocs/osImages/stability-ai.svg'

    const index = id.search('-')
    const brand = index > 0 ? id.substring(0, index) : id
    if (brand !== 'cudo') {
        switch (brand) {
            case 'alpine':
                return '/mdocs/osImages/alpine-linux.png'
            case 'amazon':
                return '/mdocs/osImages/amazon-linux.png'
            case 'centos':
                return '/mdocs/osImages/centos.svg'
            case 'debian':
                return '/mdocs/osImages/debian.svg'
            case 'devuan':
                return '/mdocs/osImages/devuan.png'
            case 'fedora':
                return '/mdocs/osImages/fedora.png'
            // todo: this id should be hyphonated in db
            case 'fedora36':
                return '/mdocs/osImages/fedora.png'
            case 'freebsd':
                return '/mdocs/osImages/freebsd.svg'
            case 'gitlab':
                return '/mdocs/osImages/gitlab.svg'
            case 'hive':
                return '/mdocs/osImages/hive.png'
            case 'opensuse':
                return '/mdocs/osImages/open-suse.png'
            case 'oracle':
                return '/mdocs/osImages/oracle.svg'
            case 'rocky':
                return '/mdocs/osImages/rocky-linux.png'
            case 'service':
                return '/mdocs/osImages/wordpress.png'
            case 'ubuntu':
                return '/mdocs/osImages/ubuntu.svg'
            case 'windows':
                return '/mdocs/osImages/windows.svg'
        }
    }
    else {
        switch (id) {
            case 'cudo-ubuntu2004-docker':
                return '/mdocs/osImages/docker.png'
            case 'cudo-ubuntu2004-blender':
                return '/mdocs/osImages/blender.png'
            case 'cudo-tensorflow-docker-gpu':
                return '/mdocs/osImages/tensorflow.svg'
            case 'cudo-ubuntu-nvidia':
                return '/mdocs/osImages/nvidia.svg'
            case 'cudo-ubuntu-focal':
                return '/mdocs/osImages/ubuntu.svg'
            default:
                return '/logo-mark-black.svg'
        }
    }
}
