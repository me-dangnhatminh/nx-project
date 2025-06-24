/* eslint-disable @typescript-eslint/no-explicit-any */
// Quick Start:
// npx prisma migrate dev --name init --schema=src/prisma/payroll/payroll.prisma
// npx prisma studio --schema=src/prisma/payroll/payroll.prisma
// npx prisma migrate deploy --schema=src/prisma/payroll/payroll.prisma
// npx prisma db push --accept-data-loss --schema=src/prisma/payroll/payroll.prisma
// npx prisma generate --schema=src/prisma/payroll/payroll.prisma

import { exec } from 'child_process';

const commonLog = (error: any, stdout: any, stderr: any) => {
  if (error) console.error(error);
  else if (stderr) console.error(stderr);
  else console.log(stdout);
};

// ==================
// ==================

exec(
  'npx prisma db push --force-reset --schema=src/prisma/schemas/employee/employee.prisma',
  commonLog,
);

// exec("npm run seed", commonLog);
