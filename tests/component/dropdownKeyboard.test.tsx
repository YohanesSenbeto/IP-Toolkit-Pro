import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import WanIpAnalyzerPage from "@/app/tools/wan-ip-analyzer/page";

// NOTE: This test will run only after dependencies are installed.
// It exercises open, navigate, select, and close behaviors of the custom dropdown.

describe("WAN IP Analyzer dropdown keyboard navigation", () => {
    it("opens with ArrowDown, navigates, selects, and closes", async () => {
        render(<WanIpAnalyzerPage />);
        const trigger = screen.getByRole("button", { name: /wan ip/i });
        trigger.focus();
        fireEvent.keyDown(trigger, { key: "ArrowDown" }); // open
        const listbox = screen.getByRole("listbox");
        // Move to a different option (Account Number) then select
        fireEvent.keyDown(listbox, { key: "ArrowDown" });
        fireEvent.keyDown(listbox, { key: "Enter" });
        // After selection the dropdown should close
        await waitFor(() =>
            expect(trigger).toHaveAttribute("aria-expanded", "false")
        );
    });
});
