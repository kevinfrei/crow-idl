#include <iomanip>
#include <iostream>
#include <string>
#include <thread>

#include <crow.h>

#include "gen.hpp"

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

    crow::json::wvalue response;
    response["id"] = received["id"];
    response["output"] = received["input"];
    std::cout << std::setprecision(std::numeric_limits<double>::max_digits10)
              << response.dump() << std::endl;
  }
  return 0;
}