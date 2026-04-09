import assert from 'node:assert/strict';
import test from 'node:test';

import { deriveHouseReading, getHouseNumberFromSlug } from './house-calculator';
import { ASTROLOGY_HOUSES } from './houses-data';

test('getHouseNumberFromSlug parses 1st and 10th house slugs', () => {
  assert.equal(getHouseNumberFromSlug('1st-house'), 1);
  assert.equal(getHouseNumberFromSlug('10th-house'), 10);
});

test('deriveHouseReading extracts cusp, planets, and summary', () => {
  const reading = deriveHouseReading(ASTROLOGY_HOUSES[0], {
    houses: [
      { house: 1, sign: 'Aries', degree: 12.4 },
      { house: 2, sign: 'Taurus', degree: 5.1 },
      { house: 3, sign: 'Gemini', degree: 1.5 },
      { house: 4, sign: 'Cancer', degree: 0.4 },
      { house: 5, sign: 'Leo', degree: 18.8 },
      { house: 6, sign: 'Virgo', degree: 22.1 },
      { house: 7, sign: 'Libra', degree: 12.4 },
      { house: 8, sign: 'Scorpio', degree: 5.1 },
      { house: 9, sign: 'Sagittarius', degree: 1.5 },
      { house: 10, sign: 'Capricorn', degree: 0.4 },
      { house: 11, sign: 'Aquarius', degree: 18.8 },
      { house: 12, sign: 'Pisces', degree: 22.1 },
    ],
    planets: [
      {
        name: 'Moon',
        sign: 'Aries',
        signDegree: 11,
        house: 1,
        retrograde: false,
      },
      {
        name: 'Mercury',
        sign: 'Aries',
        signDegree: 15,
        house: 1,
        retrograde: true,
      },
      {
        name: 'Venus',
        sign: 'Taurus',
        signDegree: 1,
        house: 2,
        retrograde: false,
      },
    ],
  });

  assert.equal(reading.houseNumber, 1);
  assert.equal(reading.cuspSign, 'Aries');
  assert.equal(reading.rulingPlanet, 'Mars');
  assert.deepEqual(
    reading.planetsInHouse.map((planet) => planet.name),
    ['Moon', 'Mercury']
  );
  assert.match(reading.headline, /1st House starts in Aries/);
  assert.match(reading.summary, /Moon in Aries/);
  assert.match(reading.activationNote, /Moon/);
});