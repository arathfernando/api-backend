// import { Connection, getManager } from 'typeorm';
// import { Seeder, Factory } from 'typeorm-seeding';
// import { Setting } from '../entities';
// import { allSettings } from './../migrations/settings';

// export class SettingCreateSeed implements Seeder {
//   public async run(factory: Factory, connection: Connection): Promise<void> {
//     await getManager().query('TRUNCATE settings');

//     allSettings.forEach(async (item) => {
//       await factory(Setting)().create({
//         key: item.key,
//         display_name: item.display_name,
//       });
//     });
//   }
// }
