import { faker } from '@faker-js/faker';
import type { RegisterDto } from '../types/auth';

const MIN_NAME_LENGTH = 4;

function createName(getName: () => string): string {
  while (true) {
    const name = getName();

    if (name.length >= MIN_NAME_LENGTH) {
      return name;
    }
  }
}

export function createRegisterUser(): RegisterDto {
  const firstName = createName(() => faker.person.firstName());
  const lastName = createName(() => faker.person.lastName());
  const username = `${faker.internet.username({ firstName, lastName })}${faker.number.int({ min: 100000, max: 999999 })}`;

  return {
    username,
    email: faker.internet.exampleEmail({ firstName, lastName }).toLowerCase(),
    password: faker.internet.password({ length: 16 }),
    firstName,
    lastName
  };
}
