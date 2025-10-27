export const getOsImageIcon = (id) => {
    if (/stability/.test(id))
        return '/osImages/stability-ai.svg'

    const index = id.search('-')
    const brand = index > 0 ? id.substring(0, index) : id
    if (brand !== 'cudo') {
        switch (brand) {
            case 'alpine':
                return '/docs/images/os/alpine-linux.png'
            case 'amazon':
                return '/docs/images/os/amazon-linux.png'
            case 'centos':
                return '/docs/images/os/centos.svg'
            case 'debian':
                return '/docs/images/os/debian.svg'
            case 'devuan':
                return '/docs/images/os/devuan.png'
            case 'fedora':
                return '/docs/images/os/fedora.png'
            // todo: this id should be hyphonated in db
            case 'fedora36':
                return '/docs/images/os/fedora.png'
            case 'freebsd':
                return '/docs/images/os/freebsd.svg'
            case 'gitlab':
                return '/docs/images/os/gitlab.svg'
            case 'hive':
                return '/docs/images/os/hive.png'
            case 'opensuse':
                return '/docs/images/os/open-suse.png'
            case 'oracle':
                return '/docs/images/os/oracle.svg'
            case 'rocky':
                return '/docs/images/os/rocky-linux.png'
            case 'service':
                return '/docs/images/os/wordpress.png'
            case 'ubuntu':
                return '/docs/images/os/ubuntu.svg'
            case 'windows':
                return '/docs/images/os/windows.svg'
        }
    }
    else {
        switch (id) {
            case 'cudo-ubuntu2004-docker':
                return '/docs/images/os/docker.png'
            case 'cudo-ubuntu2004-blender':
                return '/docs/images/os/blender.png'
            case 'cudo-tensorflow-docker-gpu':
                return '/docs/images/os/tensorflow.svg'
            case 'cudo-ubuntu-nvidia':
                return '/docs/images/os/nvidia.svg'
            case 'cudo-ubuntu-focal':
                return '/docs/images/os/ubuntu.svg'
            default:
                return '/logo-mark-black.svg'
        }
    }
}
