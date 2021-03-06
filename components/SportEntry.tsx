import { Schedule, YesterdayPlayInfoType } from '@type/Main';
import { SportTile } from '@components/index';
import { Col, Row, Spin } from 'antd';
import moment from 'moment';
import React from 'react';
import styles from './SportEntry.module.css';

type PropsType = {
  plays: YesterdayPlayInfoType[];
  loading: boolean;
};

function SportEntry({ plays, loading }: PropsType) {
  return (
    <div className={styles.yesterday_plays}>
      <div className={styles.yesterday_plays_list}>
        {loading && (
          <Row justify={'center'}>
            <Col>
              <Spin />
            </Col>
          </Row>
        )}
        {!loading && plays.length === 0 && <div className={styles.noData}>No Plays</div>}
        {!loading &&
          plays.map((game: YesterdayPlayInfoType) => (
            <div className={`${styles.game} ${game.patriots && styles.is_patriots}`} key={game.id}>
              <div className={styles.game_status}>{game.outcome?.slice(0, 1)}</div>
              <div className={styles.game_main}>
                <div className={styles.game_subinfo}>
                  <SportTile sport={game.sport?.name} />
                  <span>{`Published Yesterday at ${moment(game.publish_date).format(
                    'hh:mm A'
                  )} EST`}</span>
                </div>
                <div className={styles.game_info}>
                  <div className={styles.game_teams}>
                    {game.schedules.map((schedule: Schedule) => (
                      <React.Fragment key={schedule.id}>
                        <Row align="middle" className={styles.game_schedule_time}>
                          <img src="/images/seven-clock.png" alt="" />
                          <span>{`${moment(schedule.time).format('hh:mm A')} EST`}</span>
                        </Row>
                        <Row>
                          <div className={styles.game_team1}>
                            <img
                              src={schedule?.team.logo?.url || 'https://via.placeholder.com/100'}
                              alt="Team Logo"
                              className={styles.team_logo}
                            />
                            {game.sport.name !== 'UFC' && (
                              <span>{schedule.team.name}&nbsp;@&nbsp;</span>
                            )}
                            {game.sport.name === 'UFC' && (
                              <span>{schedule.team.name}&nbsp;vs&nbsp;</span>
                            )}
                          </div>
                          <div className={styles.game_team2}>
                            <img
                              src={
                                schedule.home_team?.logo?.url || 'https://via.placeholder.com/100'
                              }
                              alt="Team Logo"
                              className={styles.team_logo}
                            />
                            <span>{schedule.home_team.name}</span>
                          </div>
                        </Row>
                      </React.Fragment>
                    ))}
                    <Row align={'middle'} className={styles.desc_line_section}>
                      <div
                        className={`${styles.desc_line} ${
                          game.outcome === 'LOSS' ? styles.loss : ''
                        }`}>
                        <span>{game.bet_text}</span>
                        <span>
                          &nbsp;(
                          {`${game.odds > 0 ? '+' : ''}${
                            game.odds
                          } odds | ${game.odds_decimal.toFixed(2)}x)`}
                        </span>
                      </div>
                    </Row>
                  </div>
                  <div className={styles.game_score}>{game.score}</div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default SportEntry;
