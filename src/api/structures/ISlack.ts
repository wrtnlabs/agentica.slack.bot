export namespace ISlack {
  /**
   * Represents the input payload for Slack interactivity events.
   */
  export type IInteractivityInput =
    | { type: 'url_verification'; challenge: string }
    | { type: 'app_mention'; event: ISlack.Event };

  /**
   * Represents an event received from Slack.
   */
  export type Event = {
    /**
     * The ID of the user who triggered the event.
     * @example "U08HJJE9U82"
     */
    user: string;

    /**
     * The type of the event.
     * @example "app_mention"
     */
    type: string;

    /**
     * The event timestamp.
     * @example "1742291465.809079"
     */
    ts: string;

    /**
     * The text content of the event message.
     * @example "<@U08JAJRMEN8> Hi!"
     */
    text: string;

    /**
     * The team ID associated with the event.
     * @example "T08GX91HUTZ"
     */
    team: string;

    /**
     * The thread timestamp if the event is part of a thread.
     * @example "1742291226.513489"
     */
    thread_ts: string;

    /**
     * The ID of the parent user, if applicable.
     * @example "U08HJJE9U82"
     */
    parent_user_id: string;

    /**
     * The channel ID where the event occurred.
     * @example "C08HE8J3QM9"
     */
    channel: string;
  };
}
