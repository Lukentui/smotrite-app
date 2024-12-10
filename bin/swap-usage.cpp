#include <iostream>
#include <sys/sysctl.h>
#include <unistd.h>

int main() {
    int mib[2];
    mib[0] = CTL_VM;
    mib[1] = VM_SWAPUSAGE;

    struct xsw_usage swap;
    size_t len = sizeof(swap);

    if (sysctl(mib, 2, &swap, &len, NULL, 0) == -1) {
        std::cout << 0;
        return 1;
    }

    std::cout << swap.xsu_used / (1024 * 1024);

    return 0;
}