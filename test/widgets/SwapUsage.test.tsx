import { describe, it, expect, beforeEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import SwapUsage from "../../src/widgets/SwapUsage";
import { faker } from "@faker-js/faker";

describe("SwapUsage widget", () => {
    beforeEach(() => cleanup());

    it("valid swap value in GB", () => {
        const screen = render(
            <SwapUsage
                updatesHeap={{
                    swapUpdate: {
                        current: 5319,
                    },
                }}
                layoutUpdate={1}
            />,
        );

        expect(screen.getByText("5.19GB")).toBeDefined();
    });

    it("valid swap value in MB", () => {
        const memory = faker.number.int({ min: 1, max: 500 });
        const screen = render(
            <SwapUsage
                updatesHeap={{
                    swapUpdate: {
                        current: memory,
                    },
                }}
                layoutUpdate={1}
            />,
        );

        expect(screen.getByText(`${memory}MB`)).toBeDefined();
    });

    it("invalid swap value", () => {
        const screen = render(<SwapUsage updatesHeap={{}} layoutUpdate={1} />);

        expect(screen.getByText("?")).toBeDefined();
    });
});
