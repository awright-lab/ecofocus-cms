import * as migration_20250801_213933 from './20250801_213933';

export const migrations = [
  {
    up: migration_20250801_213933.up,
    down: migration_20250801_213933.down,
    name: '20250801_213933'
  },
];
