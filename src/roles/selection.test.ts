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

test('selection.isValid respects Role.isValid', () => {
  expect(selection.isValid([civilian, civilian, civilian])).toBe(false);
  expect(selection.isValid([murderer, murderer, murderer])).toBe(false);
  expect(selection.isValid([civilian, civilian, murderer, murderer])).toBe(false);
  expect(selection.isValid([civilian, civilian, murderer])).toBe(true);
  expect(selection.isValid([civilian, civilian, civilian, murderer])).toBe(true);
  expect(selection.isValid([civilian, civilian, civilian, murderer, murderer])).toBe(true);
});

test('selection.power returns sum of Role.power', () => {
    expect(selection.power([civilian, civilian, civilian])).toEqual({Civilian: 3});
    expect(selection.power([civilian, civilian, murderer, murderer])).toEqual({Civilian: 2, Murderer: 5});
    expect(selection.power([civilian, civilian, murderer])).toEqual({Civilian: 2, Murderer: 2.5});
    expect(selection.power([civilian, civilian, civilian, murderer])).toEqual({Civilian: 3, Murderer: 2.5});
    expect(selection.power([civilian, civilian, civilian, murderer, murderer])).toEqual({Civilian: 3, Murderer: 5});
});

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

//console.log(roles.roleSet(pool, 7, function (power) { return ((power["Civilian"] || 0) - (power["Murderer"] || 0)); }).map(function (r) { return r.name; }));
