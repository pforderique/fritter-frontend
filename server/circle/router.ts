
import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import CircleCollection from './collection';
import * as userValidator from '../user/middleware';
import * as circleValidator from '../circle/middleware';
import * as util from './util';
import {Types} from 'mongoose';
import UserCollection from '../user/collection';

const router = express.Router();

/**
 * Get all the circles
 *
 * @name GET /api/circles
 *
 * @return {CircleResponse[]} - A list of all the circles sorted in descending
 *                      order by date modified
 */
/**
 * Get circles by creator.
 *
 * @name GET /api/circles?username=USERNAME
 *
 * @return {CircleResponse[]} - An array of circles created by user with username `author`
 * @throws {400} - If username is not given
 * @throws {404} - If no user has given USERNAME
 *
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    // Check if authorId query parameter was supplied
    if (req.query.username !== undefined) {
      next();
      return;
    }

    const allCircles = await CircleCollection.findAll();
    const response = allCircles.map(util.constructCircleResponse);
    res.status(200).json(response);
  },
  [
    userValidator.isUsernameExists
  ],
  async (req: Request, res: Response) => {
    const creatorsCircles = await CircleCollection.findAllByCreator(req.query.username as string);
    const response = creatorsCircles.map(util.constructCircleResponse);
    res.status(200).json(response);
  }
);

/**
 * Create a new circle.
 *
 * @name POST /api/circles
 *
 * @param {string} name - The name of the circle
 * @param {string} membersId - The list of member ids, comma separated
 * @return {CircleResponse} - The created circle
 * @throws {400} - If the circle name or membersId is empty or undef
 * @throws {403} - If the user is not logged in
 * @throws {404} - If one or more users in members does not exist
 */
router.post(
  '/',
  [
    userValidator.isUserLoggedIn,
    circleValidator.isNameNonEmpty,
    circleValidator.isMembersNonEmpty,
    circleValidator.isMembersExist
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const {name, membersId} = req.body as {name: string; membersId: string};
    // Filter out emtpy strings and ids that match current user
    const ids: string[] = membersId.trim().split(',').filter(
      id => id && id !== userId);

    const circle = await CircleCollection.addOne(userId, name, ids);

    res.status(201).json({
      message: `Your circle ${name} was created successfully.`,
      circle: util.constructCircleResponse(circle)
    });
  }
);

/**
 * Create a new circle.
 *
 * @name POST /api/circles/usernames
 *
 * @param {string} name - The name of the circle
 * @param {string} memberUsernames - The list of member usernames, comma separated
 * @return {CircleResponse} - The created circle
 * @throws {400} - If the circle name or membersId is empty or undef
 * @throws {403} - If the user is not logged in
 * @throws {404} - If one or more users in members does not exist
 */
router.post(
  '/usernames',
  [
    userValidator.isUserLoggedIn,
    circleValidator.isNameNonEmpty,
    circleValidator.isMemberUsernamesNonEmpty,
    circleValidator.isMembersUsernamesExist
  ],
  async (req: Request, res: Response) => {
    const [username, userId] = [req.session.username as string, req.session.userId as string];
    const {name, memberUsernames} = req.body as {name: string; memberUsernames: string};
    // Filter out emtpy strings and ids that match current user

    const users = await Promise.all(memberUsernames.trim().split(',').filter(
      u => u && u !== username).map(async u => UserCollection.findOneByUsername(u)));

    const circle = await CircleCollection.addOne(userId, name, users.map(u => u._id));

    res.status(201).json({
      message: `Your circle ${name} was created successfully.`,
      circle: util.constructCircleResponse(circle)
    });
  }
);

/**
 * Delete a circle
 *
 * @name DELETE /api/circles/:circleId
 *
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in or is not the creator of
 *                 the circle
 * @throws {404} - If the circleId is not valid
 */
router.delete(
  '/:circleId?',
  [
    userValidator.isUserLoggedIn,
    circleValidator.isCircleExists,
    circleValidator.isCircleBelongToUser
  ],
  async (req: Request, res: Response) => {
    await CircleCollection.deleteOne(req.params.circleId);
    res.status(200).json({
      message: 'Your circle was deleted successfully.'
    });
  }
);

/**
 * Modify a circle
 *
 * @name PATCH /api/circles/:circleId
 *
 * @param {string} name - The name of the circle
 * @param {string} membersId - The list of member ids, comma separated
 * @return {CircleResponse} - the updated circle
 * @throws {400} - If membersId specified but no users specified or name specified but is empty string
 * @throws {403} - if the user is not logged in or not the creator of the circle
 * @throws {404} - If the circleId is not valid or members contains non-existent users
 */
router.patch(
  '/:circleId?',
  [
    userValidator.isUserLoggedIn,
    circleValidator.isCircleExists,
    circleValidator.isCircleBelongToUser
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const circle = await CircleCollection.findOne(req.params.circleId);
    if (req.body.name !== undefined) {
      if (req.body.name === '') {
        return res.status(400).json({error: 'New name cannot be empty string.'});
      }

      circle.name = req.body.name as string;
      await circle.save();
    }

    if (req.body.membersId !== undefined) {
      next();
      return;
    }

    res.status(200).json({
      message: 'Your circle was updated successfully.',
      circle: util.constructCircleResponse(circle)
    });
  },
  [
    circleValidator.isMembersNonEmpty,
    circleValidator.isMembersExist
  ],
  async (req: Request, res: Response) => {
    const ids: string[] = (req.body.membersId as string).trim().split(',').filter(
      id => Types.ObjectId.isValid(id) && id !== req.session.userId);
    const circle = await CircleCollection.updateOne(
      req.params.circleId, undefined, ids);

    res.status(200).json({
      message: 'Your circle was updated successfully.',
      circle: util.constructCircleResponse(circle)
    });
  }
);

export {router as circleRouter};
