import { Request, Response, NextFunction } from "express";
import * as Team from "../../models/Team";
import { ErrorCodes } from "../../models/models";
import * as logger from "../../models/logs";

/**
 * 
 * Get all teams record
 * It will be find and take team record from team collection
 * 
 **/
export function getAllTeam(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  Team.getAllTeam(
    (err: Error, TeamList: Team.ITeamContent[]) => {
      if (err) {
        req.apiStatus = {
          isSuccess: false,
          error: ErrorCodes[1003],
          data: err,
        };
        logger.error(logger.LogModule.ROUTE, req.txId, "Error in get all team = " + err);
        next();
        return;
      }
      req.apiStatus = {
        isSuccess: true,
        data: TeamList,
      };
    
      logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "teams data retrieved");
      next();
    }
  );
}

/** 
 * 
 * Get perticuler team record using teamId (mongoId)
 * It take teamId (mongoId) from req.param 
 * Find tema in team collection 
 * 
 **/
export function getTeam(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  const teamId: any = req.params.teamId;

  if (!teamId) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: "Missing Team Id!",
    };
    logger.error(logger.LogModule.ROUTE, null, "Error in get team = " + "Missing Team Id!")
    next();
    return;
  }

  Team.findTeamId(teamId, (err: Error, Team: any) => {
    if (err || !Team) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1003],
        data: err,
      };
      logger.error(logger.LogModule.ROUTE, req.txId, "Error in find team by Id = " + err)
      next();
      return;
    }

    var TeamJson = JSON.parse(JSON.stringify(Team));

    req.apiStatus = {
      isSuccess: true,
      data: TeamJson,
    };
    logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "team data retrieved");
    next();
  });
}

//Add
export function addTeam(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  //check for Team in body
  //check if user is signed in and has role as admin

  

  let payload: any = req.body;

  if (!payload) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: "Missing 'payload' or 'TeamName",
    };
    logger.error(logger.LogModule.ROUTE, req.txId, "Error in add team = " + "team name must be required!");
    next();
    return;
  }

  const TeamObj: Team.ITeamContent =
    new Team.TeamContentModel(payload);

  Team.createTeam(
    TeamObj,
    (err: any, Team: Team.ITeamContent[]) => {
      if (err || !Team) {
        req.apiStatus = {
          isSuccess: false,
          error: ErrorCodes[1002],
          data: err,
        };
        logger.debug(logger.LogModule.ROUTE, req.txId, "Error in create team = " + err);
        next();
        return;
      }

      req.apiStatus = {
        isSuccess: true,
        data: Team,
      };
      logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "team record created");
      next();
    }
  );
}

/** 
 * 
 * Update perticuler team record using teamId (mongoId)
 * It take  teamId (mongoId) from req.param and data will take from req.body 
 * Find team by teamId (mongoId) in team collection and update record
 * 
 **/
export function updateTeam(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  const teamId: any = req.params.teamId;
  const payload: any = req.body;

  if (!teamId) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: "Missing Team Id!",
    };
    logger.error(logger.LogModule.ROUTE, null, "Error in update team  = " + "Missing team Id!")
    next();
    return;
  }

  if (!payload) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: "Missing Payload (Ids)",
    };
    logger.error(logger.LogModule.ROUTE, null, "Error in update team = " + "Missing Payload data")
    next();
    return;
  }

  var boardJson: any = JSON.parse(JSON.stringify(payload));

  Team.updateTeamById(
    teamId,
    boardJson,
    (err: any, response: any) => {
      if (err) {
        req.apiStatus = {
          isSuccess: false,
          error: ErrorCodes[1002],
          data: err,
        };
        logger.error(logger.LogModule.ROUTE, req.txId, "Error in update team by id = " + err)
        next();
        return;
      }

      req.apiStatus = {
        isSuccess: true,
        data: "Team Updated",
      };
      logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "team record updated");
      next();
    }
  );
}

/** 
 * 
 * Delete perticuler team record using teamId (mongoId).
 * It take  teamId (mongoId) from req.param.
 * Find team by teamId (mongoId)in team collection and delete record from collection.
 * 
 **/
export function removeTeam(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  const teamId: any = req.params.teamId;

  if (!teamId) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: "Missing team Id!",
    };
    logger.error(logger.LogModule.ROUTE, null, "Error in remove team = " + "Missing team Id")
    next();
    return;
  }

  Team.deleteTeam(teamId, (err: any, result: any) => {
    if (err) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1005],
        data: err,
      };
      logger.error(logger.LogModule.ROUTE, req.txId, "Error in remove team by id = " + err)
      next();
      return;
    }

    req.apiStatus = {
      isSuccess: true,
      data: "Team Deleted",
    };
    logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "team deleted");
    next();
  });
}
