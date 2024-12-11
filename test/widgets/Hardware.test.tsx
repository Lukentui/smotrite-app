import { describe, it, expect, beforeEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import Network from "../../src/widgets/Network";
import Hardware from "../../src/widgets/Hardware";
import { faker } from "@faker-js/faker";

describe("Hardware widget", () => {
    beforeEach(() => cleanup());

    it("apple silicon cpu test", () => {
        const cpuName = faker.lorem.words(3);

        const screen = render(
            <Hardware
                updatesHeap={{
                    hardware: {
                        isAppleSilicon: true,
                        cpu: cpuName,
                    },
                }}
                layoutUpdate={1}
                loading={false}
            />,
        );

        expect(screen.getByText("SoC")).toBeDefined();
        expect(screen.getByText(cpuName)).toBeDefined();

        expect(screen.queryByTestId("cpu")).toBeNull();
        expect(screen.queryByTestId("gpu")).toBeNull();
    });

    it("intel cpu test", () => {
        const [cpuName, gpuName] = [faker.lorem.words(3), faker.lorem.words(3)];

        const screen = render(
            <Hardware
                updatesHeap={{
                    hardware: {
                        isAppleSilicon: false,
                        cpu: cpuName,
                        gpu: gpuName,
                    },
                }}
                layoutUpdate={1}
                loading={false}
            />,
        );

        expect(screen.queryByTestId("soc")).toBeNull();

        expect(screen.getByText(gpuName)).toBeDefined();
        expect(screen.getByText(cpuName)).toBeDefined();
    });

    it("memory banks single", () => {
        const memoryBank = faker.helpers.arrayElement([4, 2, 8, 16, 32]);

        const screen = render(
            <Hardware
                updatesHeap={{
                    hardware: {
                        memoryBanks: [memoryBank],
                    },
                }}
                layoutUpdate={1}
                loading={false}
            />,
        );

        expect(screen.getByText(`${memoryBank}GB`)).toBeDefined();
    });

    it("memory banks multiple", () => {
        const memoryBanks = faker.helpers.multiple(
            () => faker.helpers.arrayElement([4, 2, 8, 16, 32]),
            {
                count: faker.number.int({ min: 2, max: 4 }),
            },
        );

        const screen = render(
            <Hardware
                updatesHeap={{
                    hardware: {
                        memoryBanks,
                    },
                }}
                layoutUpdate={1}
                loading={false}
            />,
        );

        const totalMemory = memoryBanks.reduce((prev, curr) => prev + curr, 0);
        const banks = memoryBanks.map((v) => `${v}GB`).join(" + ");

        expect(screen.getByText(`${banks} = ${totalMemory}GB`)).toBeDefined();
    });

    it("os and serialNumber", () => {
        const [os, serialNumber] = [
            faker.lorem.words(3),
            faker.string.alphanumeric(13),
        ];

        const screen = render(
            <Hardware
                updatesHeap={{
                    hardware: {
                        os,
                        serialNumber,
                    },
                }}
                layoutUpdate={1}
                loading={false}
            />,
        );

        expect(screen.getByText(os)).toBeDefined();
        expect(screen.getByText(serialNumber)).toBeDefined();
    });
});
