import { ICommand, ICommandOption } from '../commands/ICommand.js';

/**
 * Check whether two commands are equivalent or not
 *
 * @param existingCommand – existing application command
 * @param localCommand – local command
 */
export function commandDiff(existingCommand: ICommand, localCommand: ICommand): boolean {
    const areChoicesDifferent = (existingChoices: any, localChoices: any) => {
        for (const localChoice of localChoices) {
            const existingChoice = existingChoices?.find(
                (choice: any) => choice.name === localChoice.name
            );

            if (!existingChoice) {
                return true;
            }

            if (localChoice.value !== existingChoice.value) {
                return true;
            }
        }
        return false;
    };

    const areOptionsDifferent = (existingOptions: ICommandOption[], localOptions: ICommandOption[]) => {
        for (const localOption of localOptions) {
            const existingOption = existingOptions.find(
                (option: ICommandOption) => option.name === localOption.name
            );

            if (!existingOption) {
                return true;
            }

            if (localOption.description !== existingOption.description
                || localOption.type !== existingOption.type
                || localOption.required !== existingOption.required
                || (localOption.choices?.length || 0) !== (existingOption.choices?.length || 0)
                || areChoicesDifferent(
                    localOption.choices || [],
                    existingOption.choices || []
                )
            ) {
                return true;
            }
        }
        return false;
    };

    return existingCommand.description !== localCommand.description ||
        existingCommand.options?.length !== (localCommand.options?.length || 0) ||
        areOptionsDifferent(existingCommand.options, localCommand.options || []);
}
