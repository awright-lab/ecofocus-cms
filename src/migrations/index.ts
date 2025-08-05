import * as migration_20250805_003447 from './20250805_003447';
import * as migration_20250805_013250 from './20250805_013250';

export const migrations = [
  {
    up: migration_20250805_003447.up,
    down: migration_20250805_003447.down,
    name: '20250805_003447',
  },
  {
    up: migration_20250805_013250.up,
    down: migration_20250805_013250.down,
    name: '20250805_013250'
  },
];
