import { Role, Faction } from ".";
import * as selection from "./selection";

const civilian: Role = {
    name: "Civilian",
    faction: "Civilian",
    weight: 1,
    power: 1,
    isValid: function (roles: Role[]) {
        return roles.reduce(function (nCivilian, role) { return (nCivilian + ((role.faction == "Civilian") ? 1 : 0)); }, 0) <
            roles.length;
    },
};
const murderer: Role = {
    name: "Murderer",
    faction: "Murderer",
    weight: 1,
    power: 2.5,
    isValid: function (roles: Role[]) {
        return roles.reduce(function (nMurderer, role) { return (nMurderer + ((role.faction == "Murderer") ? 1 : 0)); }, 0) <
            roles.length / 2;
    }
};

var pool: Role[] = [civilian, murderer];

test.each([
    [[civilian, civilian, civilian], false],
    [[murderer, murderer, murderer], false],
    [[civilian, civilian, murderer, murderer], false],
    [[civilian, civilian, murderer], true],
    [[civilian, civilian, civilian, murderer], true],
    [[civilian, civilian, civilian, murderer, murderer], true],
])('selection.isValid respects Role.isValid', (roles, valid) => {
  expect(selection.isValid(roles)).toBe(valid);
});

test.each([
    [[civilian, civilian, civilian], {Civilian: 3}],
    [[civilian, civilian, murderer, murderer], {Civilian: 2, Murderer: 5}],
    [[civilian, civilian, murderer], {Civilian: 2, Murderer: 2.5}],
    [[civilian, civilian, civilian, murderer], {Civilian: 3, Murderer: 2.5}],
    [[civilian, civilian, civilian, murderer, murderer], {Civilian: 3, Murderer: 5}],
])('selection.power returns sum of Role.power', (roles, power) => {
    expect(selection.power(roles)).toEqual(power);
})

test.each([
    [3],
    [4],
    [5],
    [6],
    [7],
    [8],
    [9],
    [10],
    [11],
    [12],
])('selection.random(pool, %i) returns valid role selection', (n) => {
    expect(selection.isValid(selection.random(pool, n))).toEqual(true);
});

test.each([
    [0, 0.5],
    [-1, 0.1587],
    [-1.5, 0.0668],
    [1.7, 0.9554],
    [5, 1.0000],
])('selection.normalcdf(%f) ~= %f', (x, p) => {
    expect(selection.normalcdf(x)).toBeCloseTo(p, 4);
});

const h = (power: Partial<Record<Faction, number>>) => (power["Civilian"] || 0) - (power["Murderer"] || 0);

test.each([
    [3],
    [4],
    [5],
    [6],
    [7],
    [8],
    [9],
    [10],
    [11],
    [12],
])('selection.balanced(pool, %i, h) returns valid role selection', (n) => {
    expect(selection.isValid(selection.balanced(pool, n, h))).toEqual(true);
});

test('selection.balanced(pool, 7, h) distributed according to h', () => {
    const heuristics = new Array(1000).fill(0)
        .map((_) => selection.balanced(pool, 7, h))
        .map(selection.power)
        .map(h);

    const counts = new Map([...new Set(heuristics)].map(
        x => [x, heuristics.filter(y => y === x).length]
    ));

    const bins = Array.from(counts.keys()).sort();

    const chi2 = bins.map((heuristic, i) => {
        const lower = i > 0 ? selection.normalcdf((bins[i-1] + bins[i]) / 2) : 0;
        const upper = i+1 < bins.length ? selection.normalcdf((bins[i] + bins[i+1]) / 2) : 1;

        const expected_frequency = heuristics.length * (upper - lower);
        const actual_frequency = (counts.get(heuristic) || 0);

        return (actual_frequency - expected_frequency) * (actual_frequency - expected_frequency) / expected_frequency
    }).reduce((a, b) => a + b, 0);
    
    console.log(chi2);

    expect(chi2).toBeLessThan([
        0,
        16.10265060582915,
        19.442331991486046,
        22.17444928125811,
        24.619311529849806,
        26.887242250097696,
        29.031787668394877,
        31.083789286467077,
        33.0629644580484,
        34.98284084904866,
        36.853185862561965,
        38.681330294184164,
        40.47294595059592,
        42.2325299376611,
        43.96372065749167,
        45.66951200765437,
        47.35240326482634,
        49.014506825208095,
        50.65762746051235,
        52.28332180031296,
    ][bins.length - 1]); // Four sigma for chi^2 with bins.length - 1 points. 6e-5 chance of false positive
});
