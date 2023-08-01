import ErrorResponse from "../../lib/error-handling/error-response.js";
import { generatePaginationQueries, generateSearchFilters } from "../../lib/helpers/filters.js";
import Competition from "../../models/v1/Competition.js";
import Sport from "../../models/v1/Sport.js";
import Event from "../../models/v1/Event.js";
import mongoose from "mongoose";

// Fetch all competition from the database
const fetchAllCompetition = async ({ ...reqBody }) => {
  try {
    const { page, perPage, sortBy, direction, searchQuery, showDeleted, showRecord, sportId, status } = reqBody;

    // Pagination and Sorting
    const sortDirection = direction === "asc" ? 1 : -1;

    const paginationQueries = generatePaginationQueries(page, perPage);

    let fromDate, toDate;
    if (reqBody.fromDate && reqBody.toDate) {
      fromDate = new Date(new Date(reqBody.fromDate).setUTCHours(0, 0, 0)).toISOString();
      toDate = new Date(new Date(reqBody.toDate).setUTCHours(23, 59, 59)).toISOString();
    }
    // Filters
    let filters = {};
    if (showRecord == "All") {
      filters = {
        isDeleted: showDeleted,
      };
    } else {
      filters = {
        isDeleted: showDeleted,
        isManual: true,
      };
    }
    if (sportId) {
      filters.sportId = new mongoose.Types.ObjectId(sportId)
    }

    if (status) {
      if (status == 'true') {
        filters.isActive = true
      }
      else {
        filters.isActive = false
      }
    }

    if (fromDate && toDate) {
      filters = {
        startDate: { $lte: new Date(toDate) },
        endDate: { $gte: new Date(fromDate) },
      }
    }

    if (searchQuery) {
      const fields = ["name", "sportId"];
      filters.$or = generateSearchFilters(searchQuery, fields);
    }

    const competition = await Competition.aggregate([
      {
        $match: filters,
      },
      {
        $lookup: {
          from: "sports",
          localField: "sportId",
          foreignField: "_id",
          as: "sport",
          pipeline: [
            {
              $project: { name: 1 },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$sport",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $set: {
          sportsName: "$sport.name",
        },
      },
      {
        $unset: ["sport"],
      },
      {
        $facet: {
          totalRecords: [{ $count: "count" }],
          paginatedResults: [
            {
              $sort: { [sortBy]: sortDirection },
            },
            ...paginationQueries,
          ],
        },
      },
    ]);

    for (var i = 0; i < competition[0].paginatedResults.length; i++) {

      // Condition for competition status
      if (competition[0].paginatedResults[i].startDate <= new Date() && competition[0].paginatedResults[i].endDate >= new Date()) {
        competition[0].paginatedResults[i].competitionStatus = "Ongoing"
      }
      else if (competition[0].paginatedResults[i].startDate > new Date()) {
        competition[0].paginatedResults[i].competitionStatus = "Upcoming"
      }
      else if (competition[0].paginatedResults[i].endDate < new Date()) {
        competition[0].paginatedResults[i].competitionStatus = "Completed"
      }
      else {
        competition[0].paginatedResults[i].competitionStatus = "None"
      }

      // Condition For Total Event 
      let totalEvent = await Event.count({ competitionId: competition[0].paginatedResults[i]._id });
      competition[0].paginatedResults[i].totalEvent = totalEvent;

    }

    const data = {
      records: [],
      totalRecords: 0,
    };

    if (competition?.length) {
      data.records = competition[0]?.paginatedResults || [];
      data.totalRecords = competition[0]?.totalRecords?.length ? competition[0]?.totalRecords[0].count : 0;
    }
    return data;
  } catch (e) {
    throw new ErrorResponse(e.message).status(200);
  }
};

// Fetch all competition events from the database
const fetchAllCompetitionEvents = async () => {
  try {
    const competitionEvents = await Sport.aggregate(
      [
        {
          $match: { isDeleted: false },
        },
        {
          $lookup: {
            from: "competitions",
            localField: "_id",
            foreignField: "sportId",
            as: "competitions",
            pipeline: [
              {
                $lookup: {
                  from: "events",
                  localField: "_id",
                  foreignField: "competitionId",
                  as: "events",
                  pipeline: [
                    {
                      $match: { isDeleted: false },
                    },
                    {
                      $sort: { name: 1 },
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          $sort: { name: 1 },
        },
      ],
      { collation: { locale: "en", strength: 2 } }
    );

    return competitionEvents;
  } catch (e) {
    throw new ErrorResponse(e.message).status(200);
  }
};

/**
 * Fetch compettition by Id from the database
 */
const fetchCompetitionId = async (_id) => {
  try {
    return await Competition.findById(_id);
  } catch (e) {
    throw new ErrorResponse(e.message).status(200);
  }
};

/**
 * Create competition in the database
 */
const addCometition = async ({ ...reqBody }) => {
  const {
    name,
    sportId,
    maxStake,
    maxMarket,
    betDelay,
    startDate,
    endDate,
    visibleToPlayer,
    isCustomised = false,
  } = reqBody;

  try {
    const existingCompetition = await Competition.findOne({ name: name });

    if (existingCompetition) {
      throw new Error("Competition already exists!");
    }

    const newCompetitionObj = {
      name,
      sportId,
      maxStake,
      maxMarket,
      betDelay,
      startDate,
      endDate,
      visibleToPlayer,
      createdOn: new Date(),
      isActive: true,
      isManual: true,
      isCustomised,
    };

    const newCompetition = await Competition.create(newCompetitionObj);

    return newCompetition;
  } catch (e) {
    throw new ErrorResponse(e.message).status(200);
  }
};

/**
 * update competition in the database
 */
const modifyCompetition = async ({ ...reqBody }) => {
  try {
    const competition = await Competition.findById(reqBody._id);

    if (!competition) {
      throw new Error("Competition not found.");
    }
    competition.name = reqBody.name;
    competition.sportId = reqBody.sportId;
    competition.maxStake = reqBody.maxStake;
    competition.maxMarket = reqBody.maxMarket;
    competition.betDelay = reqBody.betDelay;
    competition.startDate = reqBody.startDate;
    competition.endDate = reqBody.endDate;
    competition.visibleToPlayer = reqBody.visibleToPlayer;
    competition.isCustomised = reqBody.isCustomised;
    await competition.save();

    return competition;
  } catch (e) {
    throw new ErrorResponse(e.message).status(200);
  }
};

/**
 * delete competition in the database
 */
const removeCompetition = async (_id) => {
  try {
    const competition = await Competition.findById(_id);

    await competition.softDelete();

    return competition;
  } catch (e) {
    throw new ErrorResponse(e.message).status(200);
  }
};
const competitionStatusModify = async ({ _id, fieldName, status }) => {
  try {
    const competition = await Competition.findById(_id);

    competition[fieldName] = status;
    await competition.save();

    return competition;
  } catch (e) {
    throw new ErrorResponse(e.message).status(200);
  }
};

const activeCompetition = async ({ competitionIds, sportId }) => {
  try {
    await Competition.updateMany({ sportId }, { isActive: false });
    await Competition.updateMany({ _id: { $in: competitionIds } }, { isActive: true });
  } catch (e) {
    throw new ErrorResponse(e.message).status(200);
  }
};

export default {
  fetchAllCompetition,
  fetchAllCompetitionEvents,
  fetchCompetitionId,
  addCometition,
  modifyCompetition,
  removeCompetition,
  competitionStatusModify,
  activeCompetition,
};
