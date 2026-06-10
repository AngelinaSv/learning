import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsBetDivisibleByLines(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isBetDivisibleByLines',
      target: object.constructor,
      propertyName,
      options: {
        message: 'Bet amount must be divisible by selected lines count',
        ...validationOptions,
      },
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const dto = args.object as { lines?: unknown };

          if (!Number.isInteger(value)) {
            return true;
          }

          if (!Array.isArray(dto.lines) || dto.lines.length === 0) {
            return true;
          }

          if (!dto.lines.every((line) => Number.isInteger(line))) {
            return true;
          }

          return Number(value) % dto.lines.length === 0;
        },
      },
    });
  };
}
