export default abstract class MailTemplate<T> {
  constructor(
    protected readonly templateData: T
  ) {}

  abstract getEmail(): string

}