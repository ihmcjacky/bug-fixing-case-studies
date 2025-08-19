const ret = {};

ret.notificationType = {
    newUnmanagedDevice: 'NEW_UNMANAGED_DEVICE',
    // deviceRebootRequired: 'DEVICE_REBOOT_REQUIRED',
};

ret.notificationActionType = {
    openManagedDeviceList: 'openManagedDeviceList',
    reboot: 'reboot',
};

ret.notificationIconType = {
    loading: 'LOADING',
    success: 'SUCCESS',
    warning: 'WARNING',
    notify: 'NOTIFY',
};

export default ret;
