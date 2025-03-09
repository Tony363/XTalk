import { TaskItemIcon } from "@/app/icons/detail-icons";
import styles from "./index.module.scss";
import { Else, If, Then } from "react-if";
import { GameDisplayStatu, SUGGOALS, useChatStore } from "@/app/store";
import { useEffect, useState } from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
export function Task({
  isTaskShow,
  isConditionShow,
  isMobileScreen,
  isConditionHasChildren,
  isTaskHasChildren,
}: {
  isTaskShow: boolean;
  isConditionShow: boolean;
  isMobileScreen?: boolean;
  isConditionHasChildren?: boolean;
  isTaskHasChildren?: boolean;
}) {
  const chatStore = useChatStore();

  const { game, currentSession } = chatStore;

  const [tasks, setTasks] = useState<SUGGOALS[] | undefined>([]);
  const [failure, setFailure] = useState<SUGGOALS[] | undefined>([]);

  const findTasks = () => {
    const tasks = game?.chapter?.goals?.[0]?.subgoals?.filter(
      (subgoal) => !!subgoal?.subgoal,
    );
    setTasks(tasks);
  };

  const findFailure = () => {
    const failure = game?.chapter?.goals?.[1]?.subgoals?.filter((subgoal) => {
      return (
        subgoal.goal_anchor?.[0]?.anchor_name &&
        subgoal.goal_anchor?.[0]?.affiliate_type
      );
    });
    setFailure(failure);
  };

  const findGoalStatu = (
    goalId: string,
  ): { achieved: boolean; goal: string } => {
    return currentSession().goalStatus?.find(
      (goal: any) => goal.goal_id === goalId,
    )!;
  };

  const [gameDisplayStatus, setGameDisplayStatus] = useState<
    GameDisplayStatu | undefined
  >({});

  useEffect(() => {
    // console.log('currentSession().gameDisplayStatus', currentSession().gameDisplayStatus);
    setGameDisplayStatus(currentSession().gameDisplayStatus);
  }, [currentSession().gameDisplayStatus]);

  useEffect(() => {
    // console.log('currentSession().goalStatus', currentSession().goalStatus);
  }, [currentSession().goalStatus]);

  useEffect(() => {
    findTasks();
    findFailure();
  }, [game]);

  const fintCharacterById = (characterId: string) => {
    return game?.chapter?.characters?.find(
      (character) => character.id === characterId,
    );
  };
  const { t } = useTranslation();

  return (
    <div className={classNames([isMobileScreen ? styles.mobile : ""])}>
      <If condition={isTaskShow && isTaskHasChildren}>
        <Then>
          <div className={styles.wrapper}>
            <div className={styles.header}>
              <p>{t("GoalTask.Title")}</p>
            </div>
            <div className={styles.content}>
              <p className={styles.title}>{game?.chapter?.name}</p>
              <If condition={game?.chapter?.goal_info?.goal_displayed}>
                <Then>
                  <div>{game?.chapter?.goal_info?.goal_displayed}</div>
                </Then>
              </If>
              <If condition={tasks!?.length > 0}>
                <Then>
                  <p className={styles.line}></p>
                </Then>
              </If>
              {tasks?.map((subgoal, index) => (
                <div key={index} className={styles.task}>
                  <p>{subgoal.subgoal}</p>
                  <TaskItemIcon
                    isAcitve={findGoalStatu(subgoal.id)?.achieved}
                  />
                </div>
              ))}
            </div>
          </div>
        </Then>
      </If>
      <If condition={isConditionShow && isConditionHasChildren}>
        <Then>
          <div className={styles.wrapper}>
            <div className={styles.header}>
              <p>{t("FailureConditions.Title")}</p>
              <p>{t("FailureConditions.State")}</p>
            </div>
            <div className={styles.conditions}>
              {failure?.map((subgoal, index) => (
                <div key={index} className={styles.item}>
                  <p>
                    <If
                      condition={
                        subgoal.goal_anchor?.[0]?.affiliate_type === "npc"
                      }
                    >
                      <Then>
                        {
                          fintCharacterById(
                            subgoal.goal_anchor?.[0]?.character_id,
                          )?.name
                        }
                      </Then>
                      <Else>
                        <If
                          condition={
                            subgoal.goal_anchor?.[0]?.affiliate_type ===
                            "player"
                          }
                        >
                          <Then>Player</Then>
                        </If>
                      </Else>
                    </If>{" "}
                    {subgoal.goal_anchor?.[0]?.anchor_name} ={" "}
                    {subgoal.goal_anchor?.[0]?.anchor_goal_reached_value}
                  </p>
                  <p className={styles.state}>
                    {gameDisplayStatus?.[subgoal.goal_anchor?.[0]?.id]?.value ??
                      subgoal.goal_anchor?.[0]?.anchor_init_value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Then>
      </If>
    </div>
  );
}
