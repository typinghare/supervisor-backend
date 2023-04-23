/**
 * The environment of the app.
 */
export enum Environment {
    DEVELOPMENT,
    TEST,
    STAGING,
    PRODUCTION
}

/**
 * The stages of tasks.
 */
export enum Stage {
    /**
     * The task hasn't been started.
     */
    PENDING,

    /**
     * The task is ongoing and duration is counting.
     * Users cannot start another task while the task is ongoing.
     */
    ONGOING,

    /**
     * The task has been paused and duration is not counting.
     * Users can start another task if the task is paused.
     */
    PAUSED,

    /**
     * The task has been ended.
     */
    ENDED
}

/**
 * The actions for operating tasks.
 */
export enum Action {
    /**
     * Starting a task makes it turn into PENDING stage.
     */
    START,

    /**
     * Pausing an ongoing task makes it turn into PAUSED stage.
     */
    PAUSE,

    /**
     * Resume a paused task makes it turn into ONGOING stage.
     */
    RESUME,

    /**
     * Finish a task makes it turn into ENDED stage.
     */
    FINISH,

    /**
     * Remove a task. The task will be no longer shown on list.
     */
    REMOVE
}