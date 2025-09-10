import * as migration_20250805_003447 from './20250805_003447';
import * as migration_20250805_013250 from './20250805_013250';
import * as migration_20250805_021208 from './20250805_021208';
import * as migration_20250805_154125 from './20250805_154125';
import * as migration_20250910_000001 from './20250910_000001';
import * as migration_20250910_000002 from './20250910_000002';
import * as migration_20250910_000003 from './20250910_000003';
import * as migration_20250910_000004 from './20250910_000004';

export const migrations = [
  {
    up: migration_20250805_003447.up,
    down: migration_20250805_003447.down,
    name: '20250805_003447',
  },
  {
    up: migration_20250805_013250.up,
    down: migration_20250805_013250.down,
    name: '20250805_013250',
  },
  {
    up: migration_20250805_021208.up,
    down: migration_20250805_021208.down,
    name: '20250805_021208',
  },
  {
    up: migration_20250805_154125.up,
    down: migration_20250805_154125.down,
    name: '20250805_154125'
  },
  {
    up: migration_20250910_000001.up,
    down: migration_20250910_000001.down,
    name: '20250910_000001',
  },
  {
    up: migration_20250910_000002.up,
    down: migration_20250910_000002.down,
    name: '20250910_000002',
  },
  {
    up: migration_20250910_000003.up,
    down: migration_20250910_000003.down,
    name: '20250910_000003',
  },
  {
    up: migration_20250910_000004.up,
    down: migration_20250910_000004.down,
    name: '20250910_000004',
  },
];
