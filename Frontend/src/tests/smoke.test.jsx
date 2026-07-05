import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

const DummyComponent = () => <div>Hello from Vitest!</div>;

describe("Frontend Smoke Test", () => {
  it("renders the dummy component correctly", () => {
    render(<DummyComponent />);
    expect(screen.getByText("Hello from Vitest!")).toBeInTheDocument();
  });
});
