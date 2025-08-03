import { StringSchema, tabula } from "@bhozza/tabula";
import { DateTime } from "luxon";
import { z } from "zod";

const validator = z.object({
  date: z.coerce.date(),
});

export default defineEventHandler(async (event) => {
  const props = await getValidatedQuery(event, validator.parse);
  // Read CSV from ~/assets/namedays.tsv
  const data = await useStorage("assets:server").getItem<string>(
    "namedays.csv"
  );
  if (!data) {
    throw createError({
      statusCode: 404,
      statusMessage: "Namedays data not found",
    });
  }
  const parsed = tabula.parseTable(data, {
    schema: [StringSchema, StringSchema] as const,
  });

  const dateString = DateTime.fromJSDate(props.date).toFormat("MM-dd");

  const date = parsed.find((row) => {
    return row[0] === dateString;
  });

  if (!date) {
    throw createError({
      statusCode: 404,
      statusMessage: "Nameday not found for the given date",
    });
  }

  return {
    name: date[1],
  };
});
