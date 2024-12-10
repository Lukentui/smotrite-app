#include <iostream>
#include <vector>
#include <string>
#include <cstring>
#include <unistd.h>
#include <net/if.h>
#include <ifaddrs.h>
#include <sys/types.h>
#include <sys/sysctl.h>

struct InterfaceData {
    std::string name;
    uint64_t rx_bytes;
    uint64_t tx_bytes;
};

bool isRealNetworkInterface(const std::string& name) {
    // Проверяет, начинается ли имя интерфейса с реального сетевого префикса
    return (name.substr(0, 2) == "en" || // Ethernet интерфейсы
            name.substr(0, 2) == "wl" || // Wireless интерфейсы (вероятно)
            name.substr(0, 3) == "eth" || // Ethernet интерфейсы в Linux стиле имени
            name.substr(0, 4) == "bond" || // Bonded интерфейсы
            name.substr(0, 4) == "vlan"); // VLAN интерфейсы
}

std::vector<InterfaceData> getNetworkInterfaces() {
    std::vector<InterfaceData> interfaces;
    struct ifaddrs *ifap, *ifa;

    if (getifaddrs(&ifap) == 0) {
        for (ifa = ifap; ifa != nullptr; ifa = ifa->ifa_next) {
            if (ifa->ifa_addr && ifa->ifa_addr->sa_family == AF_LINK) {
                struct if_data *ifd = (struct if_data *)ifa->ifa_data;
                if (ifd && isRealNetworkInterface(ifa->ifa_name)) {
                    InterfaceData data;
                    data.name = ifa->ifa_name;
                    data.rx_bytes = ifd->ifi_ibytes;
                    data.tx_bytes = ifd->ifi_obytes;
                    interfaces.push_back(data);
                }
            }
        }
        freeifaddrs(ifap);
    }
    return interfaces;
}

std::string formatSpeed(double speed) {
    if (speed < 1024) {
        // Менее 1 килобайта - в байтах
        return std::to_string(speed) + " B/s";
    } else if (speed < 1024 * 1024) {
        // Менее 1 мегабайта - в килобайтах
        return std::to_string(speed / 1024) + " KB/s";
    } else {
        // В мегабайтах
        return std::to_string(speed / (1024 * 1024)) + " MB/s";
    }
}

int main() {
    // Задержка между проверками в секундах
    int delay = 1;

    auto interfaces_prev = getNetworkInterfaces();
    sleep(delay);
    auto interfaces_now = getNetworkInterfaces();

    uint64_t total_rx_prev = 0, total_tx_prev = 0;
    uint64_t total_rx_now = 0, total_tx_now = 0;

    for (const auto& iface : interfaces_prev) {
        total_rx_prev += iface.rx_bytes;
        total_tx_prev += iface.tx_bytes;
    }

    for (const auto& iface : interfaces_now) {
        total_rx_now += iface.rx_bytes;
        total_tx_now += iface.tx_bytes;
    }

    double rx_speed = static_cast<double>(total_rx_now - total_rx_prev) / delay; // B/s
    double tx_speed = static_cast<double>(total_tx_now - total_tx_prev) / delay; // B/s

    std::cout << "{ \"rx\": \"" << formatSpeed(rx_speed) << "\", \"tx\": \"" << formatSpeed(tx_speed) << "\" }" << std::endl;

    return 0;
}