export const getOsImageIcon = (id) => {
    if (/stability/.test(id))
        return '/osImages/stability-ai.svg'

    const index = id.search('-')
    const brand = index > 0 ? id.substring(0, index) : id
    if (brand !== 'cudo') {
        switch (brand) {
            case 'alpine':
                return '/osImages/alpine-linux.png'
            case 'amazon':
                return '/osImages/amazon-linux.png'
            case 'centos':
                return '/osImages/centos.svg'
            case 'debian':
                return '/osImages/debian.svg'
            case 'devuan':
                return '/osImages/devuan.png'
            case 'fedora':
                return '/osImages/fedora.png'
            // todo: this id should be hyphonated in db
            case 'fedora36':
                return '/osImages/fedora.png'
            case 'freebsd':
                return '/osImages/freebsd.svg'
            case 'gitlab':
                return '/osImages/gitlab.svg'
            case 'hive':
                return '/osImages/hive.png'
            case 'opensuse':
                return '/osImages/open-suse.png'
            case 'oracle':
                return '/osImages/oracle.svg'
            case 'rocky':
                return '/osImages/rocky-linux.png'
            case 'service':
                return '/osImages/wordpress.png'
            case 'ubuntu':
                return '/osImages/ubuntu.svg'
            case 'windows':
                return '/osImages/windows.svg'
        }
    }
    else {
        switch (id) {
            case 'cudo-ubuntu2004-docker':
                return '/osImages/docker.png'
            case 'cudo-ubuntu2004-blender':
                return '/osImages/blender.png'
            case 'cudo-tensorflow-docker-gpu':
                return '/osImages/tensorflow.svg'
            case 'cudo-ubuntu-nvidia':
                return '/osImages/nvidia.svg'
            case 'cudo-ubuntu-focal':
                return '/osImages/ubuntu.svg'
            default:
                return '/logo-mark-black.svg'
        }
    }
}
