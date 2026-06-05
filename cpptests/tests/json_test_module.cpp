#include <crow.h>
#include <gtest/gtest.h>

import std;
import ts_cpp_idl.crow_support;
import ts_cpp_idl.Shared;

TEST(JsonPickling, uint32) {
  // Test the conversion of basic types to and from JSON
  crow::json::wvalue json_value = to_json(123456);
  EXPECT_EQ(json_value.t(), crow::json::type::Number);
  std::string s = json_value.dump();
  crow::json::rvalue json_value2 = crow::json::load(s);
  std::optional<uint32_t> int_value = from_json<uint32_t>(json_value2);
  EXPECT_TRUE(int_value.has_value());
  EXPECT_EQ(int_value.value(), 123456);
  std::optional<bool> bool_value = from_json<bool>(json_value2);
  EXPECT_FALSE(bool_value.has_value());
}

TEST(JsonPickling, int32) {
  // Test the conversion of basic types to and from JSON
  crow::json::wvalue json_value = to_json(-234567);
  EXPECT_EQ(json_value.t(), crow::json::type::Number);
  std::string s = json_value.dump();
  crow::json::rvalue json_value2 = crow::json::load(s);
  auto int_value = from_json<int32_t>(json_value2);
  EXPECT_TRUE(int_value.has_value());
  EXPECT_EQ(int_value.value(), -234567);
  std::optional<std::string> str_val = from_json<std::string>(json_value2);
  EXPECT_FALSE(str_val.has_value());
}

TEST(JsonPickling, uint16) {
  // Test the conversion of basic types to and from JSON
  crow::json::wvalue json_value = to_json(12345);
  EXPECT_EQ(json_value.t(), crow::json::type::Number);
  std::string s = json_value.dump();
  crow::json::rvalue json_value2 = crow::json::load(s);
  auto int_value = from_json<uint16_t>(json_value2);
  EXPECT_TRUE(int_value.has_value());
  EXPECT_EQ(int_value.value(), 12345);
  std::optional<std::string> str_val = from_json<std::string>(json_value2);
  EXPECT_FALSE(str_val.has_value());
}

TEST(JsonPickling, int16) {
  // Test the conversion of basic types to and from JSON
  crow::json::wvalue json_value = to_json(-1234);
  EXPECT_EQ(json_value.t(), crow::json::type::Number);
  std::string s = json_value.dump();
  crow::json::rvalue json_value2 = crow::json::load(s);
  std::optional<int16_t> int_value = from_json<int16_t>(json_value2);
  EXPECT_TRUE(int_value.has_value());
  EXPECT_EQ(int_value.value(), -1234);
  std::optional<std::string> str_val = from_json<std::string>(json_value2);
  EXPECT_FALSE(str_val.has_value());
}

TEST(JsonPickling, uint8) {
  // Test the conversion of basic types to and from JSON
  crow::json::wvalue json_value = to_json(123);
  EXPECT_EQ(json_value.t(), crow::json::type::Number);
  std::string s = json_value.dump();
  crow::json::rvalue json_value2 = crow::json::load(s);
  auto int_value = from_json<uint8_t>(json_value2);
  EXPECT_TRUE(int_value.has_value());
  EXPECT_EQ(int_value.value(), 123);
  std::optional<std::string> str_val = from_json<std::string>(json_value2);
  EXPECT_FALSE(str_val.has_value());
}

TEST(JsonPickling, int8) {
  // Test the conversion of basic types to and from JSON
  crow::json::wvalue json_value = to_json(-12);
  EXPECT_EQ(json_value.t(), crow::json::type::Number);
  std::string s = json_value.dump();
  crow::json::rvalue json_value2 = crow::json::load(s);
  std::optional<int8_t> int_value = from_json<int8_t>(json_value2);
  EXPECT_TRUE(int_value.has_value());
  EXPECT_EQ(int_value.value(), -12);
  std::optional<std::string> str_val = from_json<std::string>(json_value2);
  EXPECT_FALSE(str_val.has_value());
}

TEST(JsonPickling, true) {
  crow::json::wvalue json_value = to_json(true);
  EXPECT_EQ(json_value.t(), crow::json::type::True);
  std::string s = json_value.dump();
  crow::json::rvalue json_value2 = crow::json::load(s);
  auto bool_value = from_json<bool>(json_value2);
  EXPECT_TRUE(bool_value.has_value());
  EXPECT_EQ(bool_value.value(), true);
  auto int_value = from_json<uint32_t>(json_value2);
  EXPECT_FALSE(int_value.has_value());
}

TEST(JsonPickling, false) {
  crow::json::wvalue json_value = to_json(false);
  EXPECT_EQ(json_value.t(), crow::json::type::False);
  std::string s = json_value.dump();
  crow::json::rvalue json_value2 = crow::json::load(s);
  auto bool_value = from_json<bool>(json_value2);
  EXPECT_TRUE(bool_value.has_value());
  EXPECT_EQ(bool_value.value(), false);
  auto int_value = from_json<uint16_t>(json_value2);
  EXPECT_FALSE(int_value.has_value());
}

TEST(JsonPickling, double) {
  // Test the conversion of basic types to and from JSON
  crow::json::wvalue json_value = to_json(1.25);
  EXPECT_EQ(json_value.t(), crow::json::type::Number);
  std::string s = json_value.dump();
  crow::json::rvalue json_value2 = crow::json::load(s);
  auto double_value = from_json<double>(json_value2);
  EXPECT_TRUE(double_value.has_value());
  EXPECT_EQ(double_value.value(), 1.25);
  auto int_value = from_json<uint32_t>(json_value2);
  EXPECT_FALSE(int_value.has_value());
}

TEST(JsonPickling, float) {
  // Test the conversion of basic types to and from JSON
  crow::json::wvalue json_value = to_json(1.25f);
  EXPECT_EQ(json_value.t(), crow::json::type::Number);
  std::string s = json_value.dump();
  crow::json::rvalue json_value2 = crow::json::load(s);
  auto double_value = from_json<float>(json_value2);
  EXPECT_TRUE(double_value.has_value());
  EXPECT_EQ(double_value.value(), 1.25f);
  auto int_value = from_json<uint32_t>(json_value2);
  EXPECT_FALSE(int_value.has_value());
}

TEST(JsonPickling, c_string) {
  // Test the conversion of basic types to and from JSON
  crow::json::wvalue json_value = to_json("hello");
  EXPECT_EQ(json_value.t(), crow::json::type::String);
  std::string s = json_value.dump();
  crow::json::rvalue json_value2 = crow::json::load(s);
  auto str_value = from_json<std::string>(json_value2);
  EXPECT_TRUE(str_value.has_value());
  EXPECT_EQ(str_value.value(), "hello");
  auto int_value = from_json<uint32_t>(json_value2);
  EXPECT_FALSE(int_value.has_value());
}

TEST(JsonPickling, std_string) {
  // Test the conversion of basic types to and from JSON
  crow::json::wvalue json_value = to_json(std::string("hello"));
  EXPECT_EQ(json_value.t(), crow::json::type::String);
  std::string s = json_value.dump();
  crow::json::rvalue json_value2 = crow::json::load(s);
  auto str_value = from_json<std::string>(json_value2);
  EXPECT_TRUE(str_value.has_value());
  EXPECT_EQ(str_value.value(), "hello");
  auto int_value = from_json<uint32_t>(json_value2);
  EXPECT_FALSE(int_value.has_value());
}

TEST(JsonPickling, char) {
  // Test the conversion of basic types to and from JSON
  crow::json::wvalue json_value = to_json('a');
  EXPECT_EQ(json_value.t(), crow::json::type::String);
  std::string s = json_value.dump();
  crow::json::rvalue json_value2 = crow::json::load(s);
  auto str_value = from_json<char>(json_value2);
  EXPECT_TRUE(str_value.has_value());
  EXPECT_EQ(str_value.value(), 'a');
  auto int_value = from_json<uint32_t>(json_value2);
  EXPECT_FALSE(int_value.has_value());
}

TEST(JsonPickling, std_vector) {
  // Test the conversion of basic types to and from JSON
  std::vector<int> vec = {1, 2, 3};
  crow::json::wvalue json_value = to_json(vec);
  EXPECT_EQ(json_value.t(), crow::json::type::List);
  std::string s = json_value.dump();
  crow::json::rvalue json_value2 = crow::json::load(s);
  auto vec_value = from_json<std::vector<int>>(json_value2);
  EXPECT_TRUE(vec_value.has_value());
  EXPECT_EQ(vec_value.value(), vec);
  auto int_value = from_json<uint32_t>(json_value2);
  EXPECT_FALSE(int_value.has_value());
  EXPECT_EQ(vec_value.value().size(), 3);
  EXPECT_EQ(vec_value.value()[0], 1);
  EXPECT_EQ(vec_value.value()[1], 2);
  EXPECT_EQ(vec_value.value()[2], 3);
}

TEST(JsonPickling, std_tuple) {
  // Test the conversion of basic types to and from JSON
  std::tuple<int, double, std::string> tup = {1, 2.5, "hello"};
  crow::json::wvalue json_value = to_json(tup);
  EXPECT_EQ(json_value.t(), crow::json::type::List);
  std::string s = json_value.dump();
  // std::cout << "Tuple as JSON: " << s << std::endl;
  crow::json::rvalue json_value2 = crow::json::load(s);
  auto tup_value = from_json<std::tuple<int, double, std::string>>(json_value2);
  EXPECT_TRUE(tup_value.has_value());
  EXPECT_EQ(std::get<0>(tup_value.value()), 1);
  EXPECT_EQ(std::get<1>(tup_value.value()), 2.5);
  EXPECT_EQ(std::get<2>(tup_value.value()), "hello");
  auto tup2 = from_json<std::tuple<std::string, int, double, bool>>(
      crow::json::load("[\"hi\",15,4.125,false]"));
  EXPECT_TRUE(tup2.has_value());
  EXPECT_EQ(std::get<0>(tup2.value()), "hi");
  EXPECT_EQ(std::get<1>(tup2.value()), 15);
  EXPECT_EQ(std::get<2>(tup2.value()), 4.125);
  EXPECT_EQ(std::get<3>(tup2.value()), false);
}

template <typename T>
void testSet(const T& theSet) {
  crow::json::wvalue json_value = to_json(theSet);
  // std::cout << "JSON of std::set<char>: " << json_value.dump() << std::endl;
  EXPECT_EQ(json_value.t(), crow::json::type::Object);
  EXPECT_EQ(json_value.keys().size(), 2);
  auto tag = json_value["@dataType"];
  auto val = json_value["@dataValue"];
  crow::json::wvalue_reader trdr{tag};
  std::string tagName = trdr.get(std::string{""});
  // std::cout << "Tag: " << rdr.get(std::string{"---"}) << std::endl;
  EXPECT_EQ(tag.t(), crow::json::type::String);
  EXPECT_STREQ("freik.Set", tagName.c_str());
  // std::cout << json_value.dump() << std::endl;
  EXPECT_EQ(val.t(), crow::json::type::List);
  EXPECT_EQ(val.size(), 4);
  bool z = false, b = false, c = false, q = false;
  for (uint32_t i = 0; i < 4; i++) {
    auto elem = val[i];
    EXPECT_EQ(elem.t(), crow::json::type::String);
    std::string contents =
        crow::json::wvalue_reader{elem}.get(std::string("NOPE"));
    EXPECT_EQ(contents.size(), 1);
    switch (contents[0]) {
      case 'b':
        b = true;
        break;
      case 'z':
        z = true;
        break;
      case 'c':
        c = true;
        break;
      case 'q':
        q = true;
        break;
      default:
        EXPECT_EQ("false", "Invalid item from set");
    }
  }
  EXPECT_TRUE(b && c && q && z);
  std::string s = json_value.dump();
  // std::cout << s << std::endl;
  auto set_val = from_json<T>(crow::json::load(s));
  EXPECT_TRUE(set_val.has_value());
  // Round-trip validation:
  EXPECT_EQ(*set_val, theSet);
}

TEST(JsonPickling, std_set_and_hash) {
  std::set<char> theSet{'z', 'c', 'b', 'q'};
  testSet(theSet);
  std::unordered_set<char> hashSet{'c', 'b', 'q', 'z'};
  testSet(hashSet);
}

template <typename MapType>
void testMap(const MapType& theMap) {
  crow::json::wvalue json_value = to_json(theMap);
  // std::cout << json_value.dump() << std::endl;
  EXPECT_EQ(json_value.t(), crow::json::type::Object);
  EXPECT_EQ(json_value.keys().size(), 2);
  auto tag = json_value["@dataType"];
  auto val = json_value["@dataValue"];
  crow::json::wvalue_reader trdr{tag};
  std::string tagName = trdr.get(std::string{""});
  EXPECT_EQ(tag.t(), crow::json::type::String);
  EXPECT_STREQ("freik.Map", tagName.c_str());
  // std::cout << json_value.dump() << std::endl;
  EXPECT_EQ(val.t(), crow::json::type::List);
  EXPECT_EQ(val.size(), 5);
  std::string s = json_value.dump();
  // std::cout << s << std::endl;
  auto map_val = from_json<MapType>(crow::json::load(s));
  EXPECT_TRUE(map_val.has_value());
  // Round-trip validation:
  EXPECT_EQ(*map_val, theMap);
}

TEST(JsonPickling, std_map_and_hash) {
  std::map<std::string, int> theMap{
      {"a1", 1}, {"b2", 2}, {"c3", 3}, {"d4", 4}, {"e5", 5}};
  testMap(theMap);
  std::unordered_map<std::string, int> hashMap{
      {"a1", 1}, {"b2", 2}, {"c3", 3}, {"d4", 4}, {"e5", 5}};
  testMap(hashMap);
}

// TODO: Test the 3 different enumeration types then get a
// struct-specific overload going
TEST(JsonPickling, enumClass) {
  // Test the conversion of basic types to and from JSON
  {
    crow::json::wvalue json_value = to_json(Shared::MyEnum::a);
    EXPECT_EQ(json_value.t(), crow::json::type::Number);
    std::string s = json_value.dump();
    crow::json::rvalue json_value2 = crow::json::load(s);
    auto enum_value = from_json<Shared::MyEnum>(json_value2);
    EXPECT_TRUE(enum_value.has_value());
    EXPECT_EQ(enum_value.value(), Shared::MyEnum::a);
    auto num_value = from_json<std::string>(json_value2);
    EXPECT_FALSE(num_value.has_value());
  }
  {
    crow::json::wvalue json_value = to_json(Shared::MyNEnum::b);
    EXPECT_EQ(json_value.t(), crow::json::type::Number);
    std::string s = json_value.dump();
    crow::json::rvalue json_value2 = crow::json::load(s);
    auto enum_value = from_json<Shared::MyNEnum>(json_value2);
    EXPECT_TRUE(enum_value.has_value());
    EXPECT_EQ(enum_value.value(), Shared::MyNEnum::b);
    auto str_value = from_json<std::string>(json_value2);
    EXPECT_FALSE(str_value.has_value());
  }
  {
    crow::json::wvalue json_value = to_json(Shared::MySEnum::c);
    EXPECT_EQ(json_value.t(), crow::json::type::String);
    std::string s = json_value.dump();
    crow::json::rvalue json_value2 = crow::json::load(s);
    auto enum_value = from_json<Shared::MySEnum>(json_value2);
    EXPECT_TRUE(enum_value.has_value());
    EXPECT_EQ(enum_value.value(), Shared::MySEnum::c);
    auto str_value = from_json<uint32_t>(json_value2);
    EXPECT_FALSE(str_value.has_value());
  }
}

TEST(JsonPickling, EnumAggregate) {
  Shared::Aggregate agg{
      Shared::MyEnum::c, Shared::MyNEnum::b, Shared::MySEnum::a};
  auto json_value = to_json(agg);
  std::string s = json_value.dump();
  crow::json::rvalue json_value2 = crow::json::load(s);
  auto agg_value = from_json<Shared::Aggregate>(json_value2);
  EXPECT_TRUE(agg_value.has_value());
  EXPECT_EQ(agg.le, agg_value->le);
  EXPECT_EQ(agg.ne, agg_value->ne);
  EXPECT_EQ(agg.se, agg_value->se);
}

TEST(JsonPickling, SimpleObject) {
  Shared::MyObj obj{"hello", -42, true, std::nullopt};
  auto json_value = to_json(obj);
  std::string s = json_value.dump();
  crow::json::rvalue json_value2 = crow::json::load(s);
  auto obj_value = from_json<Shared::MyObj>(json_value2);
  EXPECT_TRUE(obj_value.has_value());
  EXPECT_STREQ(obj.a.c_str(), obj_value->a.c_str());
  EXPECT_EQ(obj.b, obj_value->b);
  EXPECT_EQ(obj.c, obj_value->c);
  EXPECT_FALSE(obj.d.has_value());
  EXPECT_FALSE(obj_value->d.has_value());
}

TEST(JsonPicking, Aggregate2) {
  Shared::MySub sub{{"parent", 21, false, std::nullopt}, "child", 10};
  Shared::Aggregate2 agg{{"string", 42, true}, sub};
  auto json_value = to_json(agg);
  std::string s = json_value.dump();
  crow::json::rvalue json_value2 = crow::json::load(s);
  auto agg_value = from_json<Shared::Aggregate2>(json_value2);
  EXPECT_TRUE(agg_value.has_value());
  EXPECT_STREQ(std::get<0>(agg.tup).c_str(),
               std::get<0>(agg_value->tup).c_str());
  EXPECT_EQ(std::get<1>(agg.tup), std::get<1>(agg_value->tup));
  EXPECT_EQ(std::get<2>(agg.tup), std::get<2>(agg_value->tup));
  EXPECT_EQ(agg.opt.has_value(), agg_value->opt.has_value());
  EXPECT_STREQ(agg.opt->a.c_str(), agg_value->opt->a.c_str());
  EXPECT_EQ(agg.opt->b, agg_value->opt->b);
  EXPECT_EQ(agg.opt->c, agg_value->opt->c);
  EXPECT_EQ(agg.opt->d.has_value(), agg_value->opt->d.has_value());
  EXPECT_FALSE(agg.opt->d.has_value());
  EXPECT_FALSE(agg_value->opt->d.has_value());
  EXPECT_STREQ(agg.opt->x.c_str(), agg_value->opt->x.c_str());
  EXPECT_EQ(agg.opt->y, agg_value->opt->y);
  Shared::Aggregate3 arr;
  arr.push_back(agg);
  arr.push_back(agg);
  arr.push_back(agg);
  std::get<1>(arr[0].tup) = 21;
  std::get<1>(arr[1].tup) = 14;
  std::get<1>(arr[2].tup) = 7;
  json_value = to_json(arr);
  s = json_value.dump();
  std::cout << "Before:" << s << std::endl;
  json_value2 = crow::json::load(s);
  auto arr_value = from_json<Shared::Aggregate3>(json_value2);
  EXPECT_TRUE(arr_value.has_value());
  EXPECT_EQ(arr_value->size(), arr.size());
  // TODO: Check equivalence
}

/*
  using Tuple = std::tuple<Shared::CurrentView, std::string, double>;
  using MapType = std::map<Shared::IgnoreItemType, std::vector<Tuple>>;
  MapType myType;
  myType[Shared::IgnoreItemType::DirName] =
      std::vector<Tuple>({{Shared::CurrentView::albums, "Albums", 1.25},
                          {Shared::CurrentView::artists, "Artists", 2.5}});
  myType[Shared::IgnoreItemType::PathKeyword] = std::vector<Tuple>(
      {{Shared::CurrentView::now_playing, "Now Playing", 4.125}});
  myType[Shared::IgnoreItemType::PathRoot] = std::vector<Tuple>({});
  crow::json::wvalue json = to_json(myType);
  EXPECT_EQ(json.t(), crow::json::type::Object);
  std::string s = json.dump();
  crow::json::rvalue recv = crow::json::load(s);
  auto sentMap = from_json<MapType>(recv);

  EXPECT_TRUE(sentMap.has_value());
  EXPECT_EQ(sentMap->size(), 3);
  EXPECT_EQ(sentMap->at(Shared::IgnoreItemType::DirName).size(), 2);

  auto& dirname = sentMap->at(Shared::IgnoreItemType::DirName);
  EXPECT_EQ(dirname.size(), 2);

  auto& curView = std::get<0>(dirname[0]);
  auto& name = std::get<1>(dirname[0]);
  auto& value = std::get<2>(dirname[0]);
  EXPECT_EQ(curView, Shared::CurrentView::albums);
  EXPECT_EQ(name, "Albums");
  EXPECT_EQ(value, 1.25);

  curView = std::get<0>(dirname[1]);
  name = std::get<1>(dirname[1]);
  value = std::get<2>(dirname[1]);
  EXPECT_EQ(curView, Shared::CurrentView::artists);
  EXPECT_EQ(name, "Artists");
  EXPECT_EQ(value, 2.5);

  auto& pathkeyword = sentMap->at(Shared::IgnoreItemType::PathKeyword);
  EXPECT_EQ(pathkeyword.size(), 1);

  curView = std::get<0>(pathkeyword[0]);
  name = std::get<1>(pathkeyword[0]);
  value = std::get<2>(pathkeyword[0]);
  EXPECT_EQ(curView, Shared::CurrentView::now_playing);
  EXPECT_EQ(name, "Now Playing");
  EXPECT_EQ(value, 4.125);

  auto& pathroot = sentMap->at(Shared::IgnoreItemType::PathRoot);
  EXPECT_EQ(pathroot.size(), 0);
}

TEST(JsonPickling, CustomObject) {
  Shared::TranscodeState state;
  state.curStatus = "Transcoding";
  state.filesTranscoded = {"file1.mp3", "file2.mp3"};
  state.filesFound = 10;
  state.filesPending = 5;
  state.filesUntouched = 2;
  state.filesFailed = {{"file3.mp3", "Error 1"}, {"file4.mp3", "Error 2"}};
  state.itemsRemoved = {"item1", "item2"};
  crow::json::wvalue json = to_json(state);
  EXPECT_EQ(json.t(), crow::json::type::Object);
  std::string s = json.dump();
  // std::cout << "Serialized TranscodeState: " << s << std::endl;
  crow::json::rvalue recv = crow::json::load(s);
  auto sentState = from_json<Shared::TranscodeState>(recv);
  EXPECT_TRUE(sentState.has_value());
  EXPECT_EQ(sentState->curStatus, "Transcoding");
  EXPECT_EQ(sentState->filesTranscoded.size(), 2);
  EXPECT_EQ(sentState->filesTranscoded[0], "file1.mp3");
  EXPECT_EQ(sentState->filesTranscoded[1], "file2.mp3");
  EXPECT_EQ(sentState->filesFound, 10);
  EXPECT_EQ(sentState->filesPending, 5);
  EXPECT_EQ(sentState->filesUntouched, 2);
  EXPECT_EQ(sentState->filesFailed.size(), 2);
  EXPECT_EQ(sentState->filesFailed[0].file, "file3.mp3");
  EXPECT_EQ(sentState->filesFailed[0].error, "Error 1");
  EXPECT_EQ(sentState->filesFailed[1].file, "file4.mp3");
  EXPECT_EQ(sentState->filesFailed[1].error, "Error 2");
  EXPECT_EQ(sentState->itemsRemoved.size(), 2);
  EXPECT_EQ(sentState->itemsRemoved[0], "item1");
  EXPECT_EQ(sentState->itemsRemoved[1], "item2");
}
*/