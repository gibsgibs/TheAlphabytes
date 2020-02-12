﻿using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Configuration;
using System.Web.Mvc;

namespace FODfinder.Controllers
{
    public class FoodController : Controller
    {
        private String _API_key = WebConfigurationManager.AppSettings.Get("USDA_KEY");
        private const String USDA_FOOD_SEARCH = "https://api.nal.usda.gov/fdc/v1/search";
        async private Task<String> GetFoodResults(String query)
        {
            UriBuilder uriBuilder = new UriBuilder(USDA_FOOD_SEARCH);
            var queryParams = HttpUtility.ParseQueryString(uriBuilder.Query);
            queryParams["api_key"] = _API_key;
            queryParams["generalSearchInput"] = query;
            queryParams["includeDataTypeList"] = "Branded";
            uriBuilder.Query = queryParams.ToString();

            HttpClient client = new HttpClient();

            var response = await client.GetAsync(uriBuilder.ToString());
            var responseString = await response.Content.ReadAsStringAsync();
            return responseString;
        }
        // GET: Food
        public ActionResult Index()
        {
            Debug.WriteLine(_API_key);
            return View();
        }
    }
}