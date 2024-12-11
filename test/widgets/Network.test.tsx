import { describe, it, expect, beforeEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import Network from "../../src/widgets/Network";

describe("Network widget", () => {
    beforeEach(() => cleanup());

    it("general rendering test", () => {
        const screen = render(
            <Network
                updatesHeap={{
                    network: {
                        rx: 12345,
                        tx: 59883,
                    },
                }}
                layoutUpdate={1}
                loading={false}
            />,
        );

        expect(screen.getByText("12.3kB")).toBeDefined();
        expect(screen.getByText("59.9kB")).toBeDefined();
        expect(screen.queryByText("Loading")).toBeNull();
    });

    it.todo("with empty updatesHeap", () => {
        const screen = render(
            <Network updatesHeap={{}} layoutUpdate={1} loading={false} />,
        );

        // expect(screen.getByText('12.3kB')).toBeDefined()
        // expect(screen.getByText('59.9kB')).toBeDefined()
        // expect(screen.queryByText('Loading')).toBeNull()
    });
});
