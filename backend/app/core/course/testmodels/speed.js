const Ajv = require('ajv');

// load local dependencies
const logger = require('../../../utils/logger');
const AbstractTest = require('./abstract');

class SpeedTest extends AbstractTest.class {
    constructor() {
        super(); // noop
        this.name = 'speed';
        this.config = null;
    }

    static get schema() {
        // deep copy
        const schema = JSON.parse(JSON.stringify(AbstractTest.schema));

        /**
         * Schema for a speed test.
         *
         * ================
         * === REQUIRED ===
         * ================
         *
         * ----------------------------------------------------------------------------------------
         *   **           See AbstractTest.schema
         *                SpeedTest: 'correct' attribute is enforced and of type string.
         * ----------------------------------------------------------------------------------------
         *   seconds      Integer: processing time before the test is locked down
         *                Only for speed tests.
         * ----------------------------------------------------------------------------------------
         */
        schema['$id'] = 'SpeedTest';
        schema['properties']['category'] = {"const": "speed"};
        schema['properties']['options']['items']['properties']['correct'] = {"type": "string"};
        schema['properties']['options']['items']['required'].push('correct');
        schema['properties']['seconds'] = {"type": "integer"};
        schema['required'].push('seconds');
        return schema;
    }

    /**
     * Get the max score that is possible for this test.
     *
     * @returns Score as Integer
     */
    get maxScore() {
        if (this.config === null) {
            throw new Error('missing test config');
        }

        let score = 0;
        for (const opt of this.config['options']) {
            if ('correct' in opt) {
                score++;
            }
        }
        return score;
    }

    /**
     * Load test configuration from a JSON object.
     *
     * @param {String} config JSON config object
     * @returns true on success, false otherwise
     */
    loadConfig(config) {
        const ajv = new Ajv();
        const validate = ajv.compile(SpeedTest.schema);
        if (!validate(config)) {
            logger.warn('SpeedTest: ' + JSON.stringify(validate.errors));
            return false;
        }

        this.config = config;
        return true;
    }

    /**
     * Calculate the score for this test based on the given journal log.
     *
     * @param log Journal log as array containing selected single test options
     * @returns Object with three fields:
     *      1. score (Integer)
     *          Test score
     *      2. correct (Array)
     *          List of correct option indices
     *      3. wrong (Array)
     *          List of wrong option indices
     */
    calculateResult(log) {
        if (this.config === null) {
            throw new Error('missing test config');
        }

        let result = {
            score: 0,
            correct: [],
            wrong: []
        };
        for (let i = 0; i < log.length; i++) {
            const testOptions = this.config['options'];
            const correctOption = testOptions[i]['correct'];
            if (typeof log[i] !== 'string') {
                // not a string -> not something we can evaluate
                // this can occur when a user did not select any option in this test, in which
                // case the log will record a 'false' value for the option
                continue;
            }

            if (log[i].includes(correctOption)) {
                // correct option was selected, award a point
                result.correct.push(i);
                result.score++;
            } else if (log[i].length > 0) {
                // option was selected, but wrong
                result.wrong.push(i);
            }
        }

        return result;
    }
}

module.exports = {
    name: 'speed',
    class: SpeedTest,
    schema: SpeedTest.schema
};
