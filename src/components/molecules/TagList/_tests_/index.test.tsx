/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TagList } from "@/src/components/molecules/TagList";

describe("TagList", () => {
  afterEach(cleanup);

  it("renders one tag per item in an accessible list", () => {
    render(<TagList items={["Athletics", "Insight"]} emptyLabel="No skills" />);

    const list = screen.getByRole("list", { name: "No skills" });
    expect(list).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Athletics")).toBeInTheDocument();
  });

  it("renders the empty label instead of a list when there are no items", () => {
    render(<TagList items={[]} emptyLabel="No skills" />);

    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.getByText("No skills")).toBeInTheDocument();
  });

  it("keeps duplicated items distinct via indexed keys", () => {
    render(<TagList items={["Common", "Common"]} emptyLabel="No languages" />);

    expect(screen.getAllByText("Common")).toHaveLength(2);
  });
});
