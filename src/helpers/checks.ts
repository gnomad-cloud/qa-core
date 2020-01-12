import { StepError } from "../results";

export default class Checks {

    static ok(passed: boolean, message: string) {
        if (!passed) throw new StepError(message);
    }
    
}
