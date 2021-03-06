﻿using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using FODfinder.Models.Food;
using FODfinder.Models;
using Microsoft.AspNet.Identity;

namespace FODfinder.Utility
{
    public class IngredientParser
    {
        private const string Pattern = @"\w[\w\s-\'/]+(\([\w\s-,\'/]+\))*";
        private static readonly string[] ToRemove = { "ingredients", ":", ";", "made of", ".", "contains one or more of the following", "[", "]", "contains" };
        private static readonly string[] Variations = { "less than 2% of", "less than 2%", "2% or less of", "2% or less", "less than 2 percent" };
        public static MatchCollection MatchRegEx(string ingredientsString) => Regex.Matches(ingredientsString, Pattern);
        public static IEnumerable<string> ConvertToEnumerable(MatchCollection matches) => matches.Cast<Match>().Select(m => $"{m}".Trim());
        public static bool GetFodmapStatus(string ingredient)
        {
            using (FFDBContext db = new FFDBContext())
            {
                return db.FODMAPIngredients.Where(f => ingredient.Contains(f.Name.ToLower())).Count() != 0 ? true: false;
            }
        }
        public static string GetLabel(string ingredient)
        {
            string userID = System.Web.HttpContext.Current.User.Identity.GetUserId();
            using (FFDBContext db = new FFDBContext())
            {
                return db.UserIngredients.Where(u => u.userID == userID && u.LabelledIngredient.Name == ingredient).Select(u => u.Label).FirstOrDefault();
            }
        }
        public static Ingredient CreateNewIngredient(string ingredientName, Ingredient.Position position)
        {
            return new Ingredient(ingredientName.Trim(), GetFodmapStatus(ingredientName), GetLabel(ingredientName), position);
        }
        public static List<Ingredient> ConvertToIngredients(IEnumerable<string> ingredients)
        {
            var ingredientList = new List<Ingredient>();
            foreach (var ingredient in ingredients)
            { 
                if (ingredient.Contains("("))
                {
                    var tempList = ingredient.Replace(")", " ").Replace("(", ", ").Split(',').ToList();
                    if (tempList.Count() == 2)
                    {
                        ingredientList.Add(CreateNewIngredient($"{tempList.ElementAt(0)} ({tempList.ElementAt(1).Trim()})", Ingredient.Position.Other));
                    }
                    else
                    {
                        for (var i = 0; i < tempList.Count(); i++)
                        {
                            var subingredient = tempList.ElementAt(i).Trim();
                            var position = i == 0 ? Ingredient.Position.Parent : i == tempList.Count() - 1 ? Ingredient.Position.LastChild : Ingredient.Position.Other;
                            ingredientList.Add(CreateNewIngredient(subingredient, position));
                        }
                    }
                }
                else
                {
                    ingredientList.Add(CreateNewIngredient(ingredient, Ingredient.Position.Other));
                }
            }
            return ingredientList;
        }
        public static void Parse(string ingredients, out List<Ingredient> primaryIngredients, out List<Ingredient> secondaryIngredients)
        {
            ToRemove.ToList().ForEach(tr => ingredients = ingredients.ToLower().Replace(tr, ""));
            var index = -1;
            var length = 0;
            foreach (var variation in Variations)
            {
                if ((index = ingredients.IndexOf(variation)) != -1)
                {
                    length = variation.Length; 
                    break;
                }
            }
            var temp = index == -1 ? index = ingredients.Length : index;
            var primaryIngredientsString = ingredients.Substring(0, index);
            var secondaryIngredientsString = ingredients.Substring(index + length);
            primaryIngredients = ConvertToIngredients(ConvertToEnumerable(MatchRegEx(primaryIngredientsString)));
            secondaryIngredients = ConvertToIngredients(ConvertToEnumerable(MatchRegEx(secondaryIngredientsString)));
        }
    }
}