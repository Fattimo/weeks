## Common user flow:

                    WEEKS
    < Current Week: XX/XX/XX - XX/XX/XX >
      S M T W R F S BADGE SETTINGS
TASK  x x o o o x x star  gear
TASK (3/7)
TASK
||||
TASK
+ new task

## Data Representation:

2 sources of truth:

1. a default config which stores all of the goals of the user. The point of this config is to generate a new template week of data + keep track of all of the goals and configuration the user wants to keep

2. a record of all weeks that have come to pass.

2 and 1 can operate independently of one another. Because we want to store historical data what goals a user had set at a certain point in time, 2 should not dynamically reflect 1 at all points in time, only the current point in time.

default config:
```
type GoalConfig = {
  name: string;
  daysNeeded: number; // up to 7
};

type WeeklyTemplate = {
  [name: string]: Goal;
};
```

historical record:
```
type GoalRecord = GoalConfig & {
  daysCompleted: string[]; // an array of day identifiers, e.g. ['M', 'R', 'F']
};

type WeeklyRecord = {
  [startDay: string]: GoalRecord;
}

record: {
  [week: string]: WeeklyRecord; // week is the iso string of the first day (sunday)
}
```



## Available Scripts

In the project directory, you can run:

### `npm dev` or `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>

### `npm run build`

Builds the app for production to the `dist` folder.<br>
It correctly bundles Solid in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

## Deployment

You can deploy the `dist` folder to any static host provider (netlify, surge, now, etc.)
