import { JournalLog } from 'src/app/shared/models/state/journal.log.model';
import { JournalStructure } from './../shared/models/state/journal.structure.model';
import { MultipleOptions } from 'src/app/shared/models/procedure/categories/multiple.options.test';
import { MultipleChoice } from './../shared/models/procedure/categories/multiple.choice.test';
import { SetElementType } from 'src/app/shared/models/procedure/enums/element.type.enum';
import { RadioButtons } from 'src/app/shared/models/procedure/categories/radio.buttons.test';
import { Category } from '../shared/models/procedure/enums/category.enum';
import { Speed } from '../shared/models/procedure/categories/speed.test';
import { TestSet } from '../shared/models/procedure/testset.model';
import { ResultSet } from '../shared/models/evaluation/result.set';

const dummyTestRadioButtons: RadioButtons = {
  description: 'dummy radio button test',
  category: Category.RADIO_BUTTONS,
  elementType: SetElementType.TEST,
  evaluated: true,
  task: 'dummy radio task',
  id: 1001,
  type: 'dummyType',
  options: [ {
    text: 'dummy first option',
    correct: true
  },
  {
    text: 'dummy first option',
    correct: false
  },

]

};

const dummyTestMultipleChoice: MultipleChoice = {
  description: 'dummy multiple choice test',
  category: Category.RADIO_BUTTONS,
  elementType: SetElementType.TEST,
  evaluated: true,
  task: 'dummy multiple choice task',
  id: 1002,
  type: 'dummyType',
  options: [ {
    text: 'dummy first option',
    correct: true
  },
  {
    text: 'dummy first option',
    correct: true
  },
  {
    text: 'dummy third option',
    correct: false
  },

]

};

const dummyTestMultipleOptions: MultipleOptions = {
  description: 'dummy multiple options test',
  category: Category.RADIO_BUTTONS,
  elementType: SetElementType.TEST,
  evaluated: true,
  task: 'dummy multiple options task',
  id: 1003,
  type: 'dummyType',
  header: [ 'Yes', 'No' ],
  options: [ {
    text: 'dummy first option',
    correct: '0'
  },
  {
    text: 'dummy seccond option',
    correct: '1'
  },

]

};

const dummyTestSpeed: Speed = {
  description: 'dummy speed test',
  category: Category.RADIO_BUTTONS,
  elementType: SetElementType.TEST,
  seconds: 10,
  evaluated: true,
  task: 'dummy speed task',
  id: 1004,
  type: 'dummyType',
  options: [ {
    text: 'dummy first option',
    correct: 'um'
  },
  {
    text: 'dummy second option',
    correct: 'se'
  },

]

};

const dummyFirstSet: TestSet = {
  id: 3001,
  elements: [
    dummyTestMultipleChoice, dummyTestMultipleOptions
  ],
  scoreIndepentText: 'score independent text of the first dummy set',
  scoreDependentTexts: [
    [33, 'below average message'],
    [66, 'average message'],
    [90, 'above average message'],
    [100, 'everything correct message']
  ],
};

const dummySecondSet: TestSet = {
  id: 3002,
  elements: [
    dummyTestSpeed, dummyTestRadioButtons
  ],
  scoreIndepentText: 'score independent text of the second dummy set',
  scoreDependentTexts: [
    [33, 'below average message'],
    [66, 'average message'],
    [90, 'above average message'],
    [100, 'everything correct message']
  ],
};

export const dummyJournalStructure: JournalStructure = {
  sets: [dummyFirstSet, dummySecondSet]
};


const firstSetLog = new Map([
  [1001, [false, true]],
  [1004, ['ummy', 'se'] as any[]],
]);

const secondSetLog = new Map([
  [1002, [false, true, false]],
  [1003, [[false, true], [true, false]] as any[]],
]);

export const dummyJournalLog: JournalLog = {
  sets: [ firstSetLog, secondSetLog ]
};


export const resultSetDummy: ResultSet[] = [
  {
    id: 3001,
    tests: [
      {
        id: 1001,
        score: 0,
        maxScore: 1,
        correctOptions: [],
        wrongOptions: [0],
        singleTest: dummyTestRadioButtons,
        log: firstSetLog.get(1001),
      },
      {
        id: 1004,
        score: 1,
        maxScore: 2,
        correctOptions: [1],
        wrongOptions: [0],
        singleTest: dummyTestSpeed,
        log: firstSetLog.get(1004)
      }
    ]
  },
  {
    id: 3002,
    tests: [
      {
        id: 1002,
        score: 0,
        maxScore: 2,
        correctOptions: [1],
        wrongOptions: [0],
        singleTest: dummyTestRadioButtons,
        log: firstSetLog.get(1001),
      },
      {
        id: 1003,
        score: 0,
        maxScore: 2,
        correctOptions: [],
        wrongOptions: [0, 1],
        singleTest: dummyTestSpeed,
        log: firstSetLog.get(1004)
      }
    ]
  },
];


