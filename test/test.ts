import {Inverter} from "../src/inverter"
import {SwappableInverter} from "../src/swappable-inverter"

import { expect } from "chai";

describe("Inverter", () => {
  it("should invert", () => {
    var inverter = new Inverter("R U'");
    inverter.invert();
    expect(inverter.getAlg()).to.equal("U R'");
    expect(inverter.inversionCount).to.equal(1);
    inverter.invert();
    expect(inverter.getAlg()).to.equal("R U'");
    expect(inverter.inversionCount).to.equal(2);
  });
});

describe("SwappableInverter", () => {
  it("should allow swapping without resetting count", () => {
    var inverter = new SwappableInverter("R U'");
    inverter.invert();
    expect(inverter.getAlg()).to.equal("U R'");
    expect(inverter.inversionCount).to.equal(1);
    inverter.swap("F D");
    expect(inverter.getAlg()).to.equal("F D");
    expect(inverter.inversionCount).to.equal(1);
    inverter.swap("F D");
    inverter.invert();
    expect(inverter.getAlg()).to.equal("D' F'");
    expect(inverter.inversionCount).to.equal(2);
  });
});
