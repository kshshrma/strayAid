import { AppError } from '../utils/appError';

/**
 * Service Layer for Test module.
 * Houses pure business logic, detached from HTTP requests.
 * 
 * SOLID Principle: Single Responsibility.
 * This class is only responsible for processing backend data and calculations.
 */
export class TestService {
  /**
   * Generates a welcome message.
   * @param name Optional name to greet
   * @throws AppError if name is 'error'
   */
  public static async getWelcomeMessage(name?: string): Promise<string> {
    // Intentionally trigger an error for testing validation and the error middleware
    if (name === 'error') {
      throw new AppError('This is an intentional simulation of a Bad Request error', 400);
    }

    if (name) {
      return `Welcome to StrayAid, ${name}! The system is ready to rescue.`;
    }

    return 'Welcome to StrayAid AEOS! Quick emergency reporting is fully active.';
  }
}
