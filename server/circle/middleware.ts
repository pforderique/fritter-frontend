import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import UserCollection from '../user/collection';
import CircleCollection from './collection';

/**
 * Checks if a Circle with circleId in req.params exists
 */
const isCircleExists = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.circleId);
  const circle = validFormat ? await CircleCollection.findOne(req.params.circleId) : '';
  if (!circle) {
    res.status(404).json({
      circleNotFoundError: `Circle with circle ID ${req.params.circleId} does not exist.`
    });
    return;
  }

  next();
};

/**
 * Checks if a circleId "belongs" to signed in user
 */
const isCircleBelongToUser = async (req: Request, res: Response, next: NextFunction) => {
  const circle = await CircleCollection.findOne(req.params.circleId);
  if (circle.creatorId._id.toString() !== req.session.userId) {
    res.status(403).json({
      circleDoesNotBelongToUserError: `Circle with like ID ${req.params.circleId} did not belong to signed in user, ${req.session.username as string}.`
    });
    return;
  }

  next();
};

/**
 * Checks if a circle in req.body "belongs" to signed in user
 */
const isCircleNameBelongToUser = async (req: Request, res: Response, next: NextFunction) => {
  if (req.body.circle === 'All Followers') {
    next();
    return;
  }

  const circles = await CircleCollection.findAllByCreator(req.session.username);
  if (!circles.find(circle => circle.name === req.body.circle)) {
    res.status(403).json({
      error: `${req.session.username as string} does not have a circle named ${req.body.circle as string}.`
    });
    return;
  }

  next();
};

/**
 * Checks if a circle contains nonempty name parameter in the body
 */
const isNameNonEmpty = async (req: Request, res: Response, next: NextFunction) => {
  if (req.body.name === undefined) {
    res.status(400).json({error: 'No name given.'});
    return false;
  }

  if (req.body.name === '') {
    res.status(400).json({error: 'Name cannot be empty string.'});
    return false;
  }

  next();
  return true;
};

/**
 * Checks if the memberids field exist and is non empty
 */
const isMembersNonEmpty = async (req: Request, res: Response, next: NextFunction) => {
  const {membersId} = req.body as {membersId: string};
  if (!membersId || !membersId.trim().split(',').filter(id => id)) {
    return res.status(400).json({error: 'No member ids specified.'});
  }

  next();
};

/**
 * Checks if each member in members exist
 */
const isMembersExist = async (req: Request, res: Response, next: NextFunction) => {
  const {membersId} = req.body as {membersId: string};
  const ids: string[] = membersId.trim().split(',').filter(id => id);

  for (const id of ids) {
    if (!Types.ObjectId.isValid(id)) {
      return res.status(404).json({error: `"${id}" is an invalid ID type.`});
    }
  }

  const findings = await Promise.all(ids.map(
    async id => UserCollection.findOneByUserId(id)));

  if (findings.some(res => !res)) {
    return res.status(404).json({error: 'Some user in group does not exist.'});
  }

  next();
};

export {
  isCircleExists,
  isCircleBelongToUser,
  isCircleNameBelongToUser,
  isNameNonEmpty,
  isMembersExist,
  isMembersNonEmpty
};
