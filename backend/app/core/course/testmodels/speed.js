const Ajv = require('ajv');

// load local dependencies
const logger = require('../../../utils/logger');
const BaseTest = require('./base');

class SpeedTest extends BaseTest {
    constructor(config) {
        super(config); // noop
        this.name = 'speed';
        this.config = config;

        if (!this.loadConfig(config)) {
            throw new Error('Invalid test config');
        }
    }

    /**
     * Get the name of this test. Should always match the 'category' property of the test config
     * in a config.json file.
     *
     * @returns Name as String
     */
    static get name() {
        return 'speed';
    }

    /**
     * Get the static schema that is shared across all instances of this class.
     * When loading a config file to instantiate an object of this class, the config file contents
     * are validated against this schema.
     *
     * @returns Schema as String
     */
    static get schema() {
        // deep copy
        const schema = JSON.parse(JSON.stringify(BaseTest.baseSchema));

        /**
         * Schema for a speed test.
         *
         * ================
         * === REQUIRED ===
         * ================
         *
         * ----------------------------------------------------------------------------------------
         *   **           See BaseTest.schema
         *                SpeedTest: 'correct' attribute is enforced and of type string.
         * ----------------------------------------------------------------------------------------
         *   seconds      Integer: processing time before the test is locked down
         *                Only for speed tests.
         * ----------------------------------------------------------------------------------------
         *   index        String: index of occurence to match against.
         *                Should really be an Integer, but we have our own JSON reference replacing
         *                engine that (at the time of writing) only produces string elements after
         *                merging.
         *                Example usage: A sentence contains multiple colons (':'), but only the
         *                second one should be marked 'correct'. In this case, index should be 1
         *                (our numbering starts at 0).
         * ----------------------------------------------------------------------------------------
         */
        schema['$id'] = 'SpeedTest';
        schema['properties']['category'] = {"const": "speed"};
        schema['properties']['options']['items']['properties']['correct'] = {"type": "string"};
        schema['properties']['options']['items']['required'].push('correct');
        // TODO: 'index' property should be of type integer.
        // Change this once the JSON merge utils support non-string element creation.
        schema['properties']['options']['items']['properties']['index'] = {"type": "string"};
        schema['properties']['options']['items']['required'].push('index');
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
        let result = {
            score: 0,
            correct: [],
            wrong: []
        };
        for (let i = 0; i < log.length; i++) {
            const testOptions = this.config['options'];
            const correctOption = testOptions[i]['correct'];
            const correctOptionIndex = parseInt(testOptions[i]['index'], 10);
            if (!Array.isArray(log[i])) {
                // not an array -> not something we can evaluate
                // this can occur when a user did not select any option in this test, in which
                // case the log will record a 'false' value for the option
                logger.error('SpeedTest: calculateResult: Invalid options in journal log' + 
                             ', expected array');
                continue;
            }

            if (isNaN(correctOptionIndex)) {
                logger.error('SpeedTest: calculateResult: index property of correct option must' +
                             ' be a string parseable by parseInt()');
                continue;
            }

            const userSelectionStart = log[i][0];
            const userSelectionEnd = log[i][1];
            if (typeof userSelectionStart !== 'number' || typeof userSelectionEnd !== 'number') {
                // something went wrong.. abort. abort.
                logger.error('SpeedTest: calculateResult: Invalid option array member type' +
                             ', expected number');
                continue;
            }

            if (userSelectionStart === -1 || userSelectionEnd === -1) {
                // user started the test, but did not select any option
                // --> don't count it as wrong option, just move on
                continue;
            }

            // find all occurences of the 'correct' option in the text
            // we use this later to determine whether the user marked the correct text area
            let searchString = testOptions[i]['text'];
            const selectedText = testOptions[i]['text'].substring(userSelectionStart,
                userSelectionEnd);
            const occurences = [];
            let index = 0;
            while (index !== -1) {
                index = searchString.search(correctOption);
                if (index !== -1) {
                    searchString = searchString.slice(index + correctOption.length);
                    occurences.push({
                        start: index,
                        end: index + correctOption.length
                    });
                }
            }

            // a point is awarded if:
            //      1. the selected text includes the correct text (as defined in the config)
            //      2. the text is the n-th occurence (as defined in the config)
            let selectedOccurence = -1;
            for (let i = 0; i < occurences.length; i++) {
                if (userSelectionStart <= occurences[i].start
                        && userSelectionEnd >= occurences[i].end) {
                    selectedOccurence = i;
                }
            }

            if (selectedText.includes(correctOption)
                    && selectedOccurence === correctOptionIndex) {
                // correct option was selected, award a point
                result.correct.push(i);
                result.score++;
            } else {
                // either wrong text (not matching the 'correct' property of the test config) or a
                // wrong occurence of the text was selected
                result.wrong.push(i);
            }
        }

        return result;
    }
}

module.exports = SpeedTest;
