import { json } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { APIChain } from "langchain/chains";

// Source: https://js.langchain.com/docs/modules/chains/other_chains/api_chain

export async function action({ request }) {
  const OPEN_METEO_DOCS = `
  BASE URL: https://api.open-meteo.com/

  API Documentation
  The API endpoint /v1/forecast accepts a geographical coordinate, a list of weather variables and responds with a JSON hourly weather forecast for 7 days. Time always starts at 0:00 today and contains 168 hours. All URL parameters are listed below:

  Parameter	Format	Required	Default	Description
  latitude, longitude	Floating point	Yes		Geographical WGS84 coordinate of the location
  hourly	String array	No		A list of weather variables which should be returned. Values can be comma separated, or multiple &hourly= parameter in the URL can be used.
  daily	String array	No		A list of daily weather variable aggregations which should be returned. Values can be comma separated, or multiple &daily= parameter in the URL can be used. If daily weather variables are specified, parameter timezone is required.
  current_weather	Bool	No	false	Include current weather conditions in the JSON output.
  temperature_unit	String	No	celsius	If fahrenheit is set, all temperature values are converted to Fahrenheit.
  windspeed_unit	String	No	kmh	Other wind speed speed units: ms, mph and kn
  precipitation_unit	String	No	mm	Other precipitation amount units: inch
  timeformat	String	No	iso8601	If format unixtime is selected, all time values are returned in UNIX epoch time in seconds. Please note that all timestamp are in GMT+0! For daily values with unix timestamps, please apply utc_offset_seconds again to get the correct date.
  timezone	String	No	GMT	If timezone is set, all timestamps are returned as local-time and data is returned starting at 00:00 local-time. Any time zone name from the time zone database is supported. If auto is set as a time zone, the coordinates will be automatically resolved to the local time zone.
  past_days	Integer (0-2)	No	0	If past_days is set, yesterday or the day before yesterday data are also returned.
  start_date
  end_date	String (yyyy-mm-dd)	No		The time interval to get weather data. A day must be specified as an ISO8601 date (e.g. 2022-06-30).
  models	String array	No	auto	Manually select one or more weather models. Per default, the best suitable weather models will be combined.

  Variable	Valid time	Unit	Description
  temperature_2m	Instant	°C (°F)	Air temperature at 2 meters above ground
  snowfall	Preceding hour sum	cm (inch)	Snowfall amount of the preceding hour in centimeters. For the water equivalent in millimeter, divide by 7. E.g. 7 cm snow = 10 mm precipitation water equivalent
  rain	Preceding hour sum	mm (inch)	Rain from large scale weather systems of the preceding hour in millimeter
  showers	Preceding hour sum	mm (inch)	Showers from convective precipitation in millimeters from the preceding hour
  weathercode	Instant	WMO code	Weather condition as a numeric code. Follow WMO weather interpretation codes. See table below for details.
  snow_depth	Instant	meters	Snow depth on the ground
  freezinglevel_height	Instant	meters	Altitude above sea level of the 0°C level
  visibility	Instant	meters	Viewing distance in meters. Influenced by low clouds, humidity and aerosols. Maximum visibility is approximately 24 km.
`;
  const formData = await request.formData();
  const location = formData.get("location");

  const model = new ChatOpenAI();

  const template =
    "What is the weather like right now in {location} in Celcius?";
  const prompt = new PromptTemplate({
    template,
    inputVariables: ["location"],
  });
  const filledPrompt = await prompt.format({ location });

  const chain = APIChain.fromLLMAndAPIDocs(model, OPEN_METEO_DOCS);
  const res = await chain.call({
    question: filledPrompt,
  });
  console.log("Got result: ", res);
  return json({ result: res });
}
export default function WeatherAPIForm() {
  const navigation = useNavigation();
  const showLoading =
    navigation.state === "submitting" || navigation.state === "loading";

  const data = useActionData() || {};
  let formattedResult = data?.result?.output;
  return (
    <div>
      <h2 className="pb-4 text-xl">
        Enter a location, receive current weather conditions.
      </h2>
      <div className="text-md pb-2 text-gray-700">
        <span className="font-bold">Actual prompt: </span>
        {`"What is the weather like right now in {location} in Celcius?`}
      </div>
      <div className="text-md pb-2 text-gray-700">
        <span className="font-bold">Data Source: </span>
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
          Open Meteo
        </a>
      </div>
      <Form method="post" className="space-y-6 py-4">
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700"
          >
            Location
          </label>
          <div className="mt-1">
            <input
              id="location"
              required
              name="location"
              type="text"
              className="bg-whitepx-2 w-full rounded border border-gray-500 bg-[color:rgba(209,190,230,0.9)] py-1 text-lg"
            />
          </div>
        </div>
        <button
          disabled={showLoading}
          type="submit"
          className="w-full rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-800 focus:bg-purple-400"
        >
          {showLoading ? "Submitting..." : "Submit"}
        </button>
      </Form>
      <label className="block text-sm font-medium text-gray-700">Output</label>
      <div className="mt-1">
        <textarea
          id="output"
          name="output"
          className="w-full rounded border border-gray-500 bg-[color:rgba(209,190,230,0.9)] px-2 py-1 text-lg"
          rows={4}
          readOnly
          value={formattedResult || ""}
        />
      </div>
      <Link
        to="/prompt"
        className="flex items-center justify-center rounded-md border border-purple-800 bg-[color:rgba(209,190,230,0.9)] px-4 py-3 text-base font-medium text-purple-700 shadow-sm hover:bg-purple-300 sm:px-8"
      >
        Back
      </Link>
    </div>
  );
}
