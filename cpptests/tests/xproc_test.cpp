#include <functional>
#include <iomanip>
#include <iostream>
#include <map>
#include <optional>
#include <set>
#include <string>
#include <thread>
#include <unordered_map>
#include <unordered_set>

#include <crow.h>

#include "gen.hpp"

bool justEcho(const crow::json::rvalue& v, crow::json::wvalue& out) {
  out["output"] = v;
  return true;
}

bool chkMyI8(const crow::json::rvalue& v, crow::json::wvalue& out) {
  if (v.t() != crow::json::type::Number)
    return false;
  std::optional<std::int8_t> val = from_json<std::int8_t>(v);
  if (val.has_value() && *val == -122) {
    out["output"] = to_json(*val);
    return true;
  }
  out["error"] = "Value is not -122 or not an int8";
  return false;
}

bool chkMyI16(const crow::json::rvalue& v, crow::json::wvalue& out) {
  if (v.t() != crow::json::type::Number)
    return false;
  std::optional<std::int16_t> val = from_json<std::int16_t>(v);
  if (val.has_value() && *val == -16384) {
    out["output"] = to_json(*val);
    return true;
  }
  out["error"] = "Value is not -16384 or not an int16";
  return false;
}

bool chkMyI32(const crow::json::rvalue& v, crow::json::wvalue& out) {
  if (v.t() != crow::json::type::Number)
    return false;
  std::optional<std::int32_t> val = from_json<std::int32_t>(v);
  if (val.has_value() && *val == -2097152) {
    out["output"] = to_json(*val);
    return true;
  }
  out["error"] = "Value is not -2097152 or not an int32";
  return false;
}

bool chkMyI64(const crow::json::rvalue& v, crow::json::wvalue& out) {
  if (v.t() != crow::json::type::Number)
    return false;
  std::optional<std::int64_t> val = from_json<std::int64_t>(v);
  if (val.has_value() && *val == -123456789012345LL) {
    out["output"] = to_json(*val);
    return true;
  }
  out["error"] =
      "Value is not -123456789012345 or not an int64: " + std::to_string(*val);
  return false;
}

bool chkMyU8(const crow::json::rvalue& v, crow::json::wvalue& out) {
  if (v.t() != crow::json::type::Number)
    return false;
  std::optional<std::uint8_t> val = from_json<std::uint8_t>(v);
  if (val.has_value() && *val == 255) {
    out["output"] = to_json(*val);
    return true;
  }
  out["error"] = "Value is not 255 or not a uint8";
  return false;
}

bool chkMyU16(const crow::json::rvalue& v, crow::json::wvalue& out) {
  if (v.t() != crow::json::type::Number)
    return false;
  std::optional<std::uint16_t> val = from_json<std::uint16_t>(v);
  if (val.has_value() && *val == 65535) {
    out["output"] = to_json(*val);
    return true;
  }
  out["error"] = "Value is not 65535 or not a uint16";
  return false;
}

bool chkMyU32(const crow::json::rvalue& v, crow::json::wvalue& out) {
  if (v.t() != crow::json::type::Number)
    return false;
  std::optional<std::uint32_t> val = from_json<std::uint32_t>(v);
  if (val.has_value() && *val == 4294967295U) {
    out["output"] = to_json(*val);
    return true;
  }
  out["error"] = "Value is not 4294967295 or not a uint32";
  return false;
}

bool chkMyU64(const crow::json::rvalue& v, crow::json::wvalue& out) {
  if (v.t() != crow::json::type::Number)
    return false;
  std::optional<std::uint64_t> val = from_json<std::uint64_t>(v);
  if (val.has_value() && *val == 9876543210987654ULL) {
    out["output"] = to_json(*val);
    return true;
  }
  out["error"] = "Value is not 9876543210987654 or not a uint64";
  return false;
}

bool chkMyFloat(const crow::json::rvalue& v, crow::json::wvalue& out) {
  if (v.t() != crow::json::type::Number)
    return false;
  std::optional<float> val = from_json<float>(v);
  if (val.has_value() && *val == 3.14f) {
    out["output"] = to_json(*val);
    return true;
  }
  out["error"] = "Value is not 3.14 or not a float";
  return false;
}

bool chkMyString(const crow::json::rvalue& v, crow::json::wvalue& out) {
  if (v.t() != crow::json::type::String)
    return false;
  std::optional<std::string> val = from_json<std::string>(v);
  if (val.has_value() && *val == "Hello, World!") {
    out["output"] = to_json(*val);
    return true;
  }
  out["error"] = "Value is not 'Hello, World!' or not a string";
  return false;
}

bool chkMyBoolean(const crow::json::rvalue& v, crow::json::wvalue& out) {
  if (v.t() != crow::json::type::True && v.t() != crow::json::type::False)
    return false;
  std::optional<bool> val = from_json<bool>(v);
  if (val.has_value() && *val == true) {
    out["output"] = to_json(*val);
    return true;
  }
  out["error"] = "Value is not true or not a boolean";
  return false;
}

bool chkMyChar(const crow::json::rvalue& v, crow::json::wvalue& out) {
  if (v.t() != crow::json::type::String)
    return false;
  std::optional<char> val = from_json<char>(v);
  if (val.has_value() && *val == 'A') {
    out["output"] = to_json(*val);
    return true;
  }
  out["error"] = "Value is not 'A' or not a char";
  return false;
}

bool chkInt8Array(const crow::json::rvalue& v, crow::json::wvalue& out) {
  if (v.t() != crow::json::type::List)
    return false;
  std::optional<std::vector<std::int8_t>> val =
      from_json<std::vector<std::int8_t>>(v);
  if (val.has_value() && *val == std::vector<std::int8_t>{-128, 0, 127}) {
    out["output"] = to_json(*val);
    return true;
  }
  out["error"] = "Value is not [-128, 0, 127] or not a list of int8";
  return false;
}

bool chkInt16Set(const crow::json::rvalue& v, crow::json::wvalue& out) {
  if (v.t() != crow::json::type::List)
    return false;
  std::optional<std::set<std::int16_t>> val =
      from_json<std::set<std::int16_t>>(v);
  if (val.has_value() && *val == std::set<std::int16_t>{1, 2, 3}) {
    out["output"] = to_json(*val);
    return true;
  }
  out["error"] = "Value is not [1, 2, 3] or not a list of int16";
  return false;
}

bool chkCharFastSet(const crow::json::rvalue& v, crow::json::wvalue& out) {
  if (v.t() != crow::json::type::List)
    return false;
  std::optional<std::unordered_set<char>> val =
      from_json<std::unordered_set<char>>(v);
  if (val.has_value() && *val == std::unordered_set<char>{'x', 'y', 'z'}) {
    out["output"] = to_json(*val);
    return true;
  }
  out["error"] = "Value is not {'x', 'y', 'z'} or not a list of char";
  return false;
}

bool chkInt32toStrMap(const crow::json::rvalue& v, crow::json::wvalue& out) {
  if (v.t() != crow::json::type::Object)
    return false;
  std::optional<std::map<std::int32_t, std::string>> val =
      from_json<std::map<std::int32_t, std::string>>(v);
  if (val.has_value() &&
      *val == std::map<std::int32_t, std::string>{{1, "one"}, {2, "two"}}) {
    out["output"] = to_json(*val);
    return true;
  }
  out["error"] =
      "Value is not {1: 'one', 2: 'two'} or not an object of int32 to string";
  return false;
}

bool chkStrToU16FastMap(const crow::json::rvalue& v, crow::json::wvalue& out) {
  if (v.t() != crow::json::type::Object)
    return false;
  std::optional<std::unordered_map<std::string, std::uint16_t>> val =
      from_json<std::unordered_map<std::string, std::uint16_t>>(v);
  if (val.has_value() && *val == std::unordered_map<std::string, std::uint16_t>{
                                     {"a", 1}, {"b", 2}}) {
    out["output"] = to_json(*val);
    return true;
  }
  out["error"] =
      "Value is not {'a': 1, 'b': 2} or not an object of string to uint16";
  return false;
}

bool chkMyObj(const crow::json::rvalue& v, crow::json::wvalue& out) {
  if (v.t() != crow::json::type::Object)
    return false;
  std::optional<Shared::MyObj> val = from_json<Shared::MyObj>(v);
  if (val.has_value() && val->a == "hello" && val->b == -42 && val->c == true &&
      val->d.has_value() && *val->d == 'o') {
    out["output"] = to_json(*val);
    return true;
  }
  out["error"] = "Value does not match expected MyObj structure";
  return false;
}

bool chkMySub(const crow::json::rvalue& v, crow::json::wvalue& out) {
  if (v.t() != crow::json::type::Object)
    return false;
  std::optional<Shared::MySub> val = from_json<Shared::MySub>(v);
  if (val.has_value() && val->a == "parent" && val->b == 21 &&
      val->c == false && val->d.has_value() && *val->d == 'x' &&
      val->x == "child" && val->y == 10) {
    out["output"] = to_json(*val);
    return true;
  }
  out["error"] = "Value does not match expected MySub structure";
  return false;
}

bool chkMyTup(const crow::json::rvalue& v, crow::json::wvalue& out) {
  if (v.t() != crow::json::type::List)
    return false;
  std::optional<Shared::MyTup> val = from_json<Shared::MyTup>(v);
  if (val.has_value() && std::get<0>(*val) == "string" &&
      std::get<1>(*val) == 42 && std::get<2>(*val) == true) {
    out["output"] = to_json(*val);
    return true;
  }
  out["error"] = "Value does not match expected MyTup structure";
  return false;
}

bool chkMyOpt(const crow::json::rvalue& v, crow::json::wvalue& out) {
  if (v.t() != crow::json::type::Object)
    return false;
  std::optional<Shared::MyOpt> val = from_json<Shared::MyOpt>(v);
  if (val.has_value() && (*val).has_value() && (*val)->a == "opt" &&
      (*val)->b == 7 && (*val)->c == true && (*val)->d.has_value() &&
      *(*val)->d == 'x' && (*val)->x == "subopt" && (*val)->y == 88) {
    out["output"] = to_json(*val);
    return true;
  }
  out["error"] = "Value does not match expected MyOpt structure";
  return false;
}

bool chkMyEnum(const crow::json::rvalue& v, crow::json::wvalue& out) {
  if (v.t() != crow::json::type::String)
    return false;
  std::optional<Shared::MyEnum> val = from_json<Shared::MyEnum>(v);
  if (val.has_value() && *val == Shared::MyEnum::a) {
    out["output"] = to_json(*val);
    return true;
  }
  out["error"] = "Value is not 'a' or not a MyEnum";
  return false;
}

bool chkMyNEnum(const crow::json::rvalue& v, crow::json::wvalue& out) {
  if (v.t() != crow::json::type::Number)
    return false;
  std::optional<Shared::MyNEnum> val = from_json<Shared::MyNEnum>(v);
  if (val.has_value() && *val == Shared::MyNEnum::c) {
    out["output"] = to_json(*val);
    return true;
  }
  out["error"] = "Value is not 3 or not a MyNEnum";
  return false;
}

bool chkMySEnum(const crow::json::rvalue& v, crow::json::wvalue& out) {
  if (v.t() != crow::json::type::String)
    return false;
  std::optional<Shared::MySEnum> val = from_json<Shared::MySEnum>(v);
  if (val.has_value() && *val == Shared::MySEnum::b) {
    out["output"] = to_json(*val);
    return true;
  }
  out["error"] = "Value is not 'b' or not a MySEnum";
  return false;
}

bool chkAggregate(const crow::json::rvalue& v, crow::json::wvalue& out) {
  if (v.t() != crow::json::type::Object)
    return false;
  std::optional<Shared::Aggregate> val = from_json<Shared::Aggregate>(v);
  if (val.has_value() && val->le == Shared::MyEnum::a &&
      val->ne == Shared::MyNEnum::b && val->se == Shared::MySEnum::a) {
    out["output"] = to_json(*val);
    return true;
  }
  out["error"] = "Value does not match expected Aggregate structure";
  return false;
}

bool chkAggregate2(const crow::json::rvalue& v, crow::json::wvalue& out) {
  if (v.t() != crow::json::type::Object)
    return false;
  std::optional<Shared::Aggregate2> val = from_json<Shared::Aggregate2>(v);
  if (val.has_value() && std::get<0>(val->tup) == "agg2" &&
      std::get<1>(val->tup) == 456 && std::get<2>(val->tup) == true &&
      val->opt.has_value() && val->opt->a == "opt2" && val->opt->b == 8 &&
      val->opt->c == false && !val->opt->d.has_value() &&
      val->opt->x == "subopt2" && val->opt->y == 77) {
    out["output"] = to_json(*val);
    return true;
  }
  out["error"] = "Value does not match expected Aggregate2 structure";
  return false;
}

bool chkAggregate3(const crow::json::rvalue& v, crow::json::wvalue& out) {
  if (v.t() != crow::json::type::List)
    return false;
  std::optional<std::vector<Shared::Aggregate2>> val =
      from_json<std::vector<Shared::Aggregate2>>(v);
  if (val.has_value() && val->size() == 1 &&
      std::get<0>(val->at(0).tup) == "string" &&
      std::get<1>(val->at(0).tup) == 42 &&
      std::get<2>(val->at(0).tup) == true && val->at(0).opt.has_value() &&
      val->at(0).opt->a == "parent" && val->at(0).opt->b == 21 &&
      val->at(0).opt->c == false && val->at(0).opt->d.has_value() &&
      *val->at(0).opt->d == 'x' && val->at(0).opt->x == "child" &&
      val->at(0).opt->y == 10) {
    out["output"] = to_json(val->at(0));
    return true;
  }
  out["error"] = "Value does not match expected Aggregate3 structure";
  return false;
}

const std::map<
    std::string,
    std::function<bool(const crow::json::rvalue&, crow::json::wvalue&)>>
    tests{{"echo", justEcho},
          {"MyI8", chkMyI8},
          {"MyI16", chkMyI16},
          {"MyI32", chkMyI32},
          {"MyI64", chkMyI64},
          {"MyU8", chkMyU8},
          {"MyU16", chkMyU16},
          {"MyU32", chkMyU32},
          {"MyU64", chkMyU64},
          {"MyFloat", chkMyFloat},
          {"MyString", chkMyString},
          {"MyBoolean", chkMyBoolean},
          {"MyChar", chkMyChar},
          {"Int8Array", chkInt8Array},
          {"Int16Set", chkInt16Set},
          {"CharFastSet", chkCharFastSet},
          {"Int32toStrMap", chkInt32toStrMap},
          {"StrToU16FastMap", chkStrToU16FastMap},
          {"MyObj", chkMyObj},
          {"MySub", chkMySub},
          {"MyTup", chkMyTup},
          {"MyOpt", chkMyOpt},
          {"MyEnum", chkMyEnum},
          {"MyNEnum", chkMyNEnum},
          {"MySEnum", chkMySEnum},
          {"Aggregate", chkAggregate},
          {"Aggregate2", chkAggregate2},
          {"Aggregate3", chkAggregate3}};
int main() {
  // Standard I/O can be finicky with buffering; force line-buffering
  setvbuf(stdout, NULL, _IOLBF, BUFSIZ);
  std::string line;
  // Just read data from stdin, parse it as JSON, then write it as a response to
  // stdout.
  // This is just a simple test of the JSON parsing and
  while (std::getline(std::cin, line)) {
    if (line.empty())
      continue;

    auto received = crow::json::load(line);
    if (!received) {
      std::cout << "{\"error\": \"no data received\"}" << std::endl;
      continue;
    }
    if (received.t() != crow::json::type::Object) {
      std::cout << "{\"error\": \"not an object\"}" << std::endl;
      continue;
    }
    if (!received.has("id")) {
      std::cout << "{\"error\": \"missing required field 'id'\"}" << std::endl;
      continue;
    }

    if (!received.has("input")) {
      std::cout << "{\"error\": \"missing required field 'input'\"}"
                << std::endl;
      continue;
    }
    auto id = received["id"];
    if (id.t() != crow::json::type::String) {
      std::cout << "{\"error\": \"field 'id' must be a string\"}" << std::endl;
      continue;
    }
    crow::json::wvalue response;
    auto s = id.s();
    auto iter = tests.find(s);
    if (iter == tests.end()) {
      std::cout << "{\"error\": \"unknown id " << s << "\"}" << std::endl;
      continue;
    }
    auto chk = iter->second;
    if (chk(received["input"], response)) {
      response["id"] = received["id"];
      std::cout << std::setprecision(std::numeric_limits<double>::max_digits10)
                << response.dump() << std::endl;
    } else {
      std::cout << response.dump() << std::endl;
      // "{\"error\": \"input did not match expected value for " << s << "\"}"
      // << std::endl;
      continue;
    }
  }
  return 0;
}