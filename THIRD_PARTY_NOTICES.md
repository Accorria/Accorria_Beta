# THIRD_PARTY_NOTICES.md

This document lists third‑party software used by **Accorria** and provides their license notices. Using these libraries **does not transfer** any ownership of Accorria's IP. Keep this file in your repo root and update it when dependencies change.

> Tip: regenerate periodically (e.g., per release) with tools like `pip-licenses` or `liccheck` and append any new entries.

---

## 1) Dependency Summary

| Package / Project                      | License      | Upstream                                                                                 | Notes                                  |
| -------------------------------------- | ------------ | ---------------------------------------------------------------------------------------- | -------------------------------------- |
| **CrewAI**                             | MIT          | [https://github.com/crewAIInc/crewAI](https://github.com/crewAIInc/crewAI)               | Multi‑agent orchestration framework    |
| **langchain-openai**                   | MIT          | [https://pypi.org/project/langchain-openai/](https://pypi.org/project/langchain-openai/) | OpenAI integration used by some agents |
| **FastAPI**                            | MIT          | [https://fastapi.tiangolo.com/](https://fastapi.tiangolo.com/)                           | Web API framework                      |
| **Starlette**                          | BSD‑3‑Clause | [https://www.starlette.io/](https://www.starlette.io/)                                   | FastAPI depends on Starlette           |
| **Pydantic**                           | MIT          | [https://docs.pydantic.dev/](https://docs.pydantic.dev/)                                 | Data validation (FastAPI dependency)   |
| **Uvicorn**                            | BSD‑3‑Clause | [https://www.uvicorn.org/](https://www.uvicorn.org/)                                     | ASGI server                            |
| **python-dotenv**                      | BSD‑3‑Clause | [https://pypi.org/project/python-dotenv/](https://pypi.org/project/python-dotenv/)       | Loads env vars in dev                  |
| **Google Agent Development Kit (ADK)** | Apache‑2.0   | [https://github.com/google/adk-python](https://github.com/google/adk-python)             | Optional: for ADK-based agents         |

> If your build includes additional libraries, add them here with their license and link.

---

## 2) License Texts

Below are the full texts (or required notices) of the licenses referenced above.

### MIT License

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

### Apache License 2.0 (Summary & Notice)

This product may include software developed by Google LLC and other contributors under the **Apache License, Version 2.0**. A copy of the license is included below. Apache‑2.0 requires preservation of the license and any NOTICE files.

**Apache‑2.0 NOTICE (example):**

```
Portions of this software are licensed under the Apache License, Version 2.0.
Copyright (c) 2024–2025 Google LLC and contributors.
```

**Full text:**

```
Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

1. Definitions.
"License" shall mean the terms and conditions for use, reproduction, and distribution as defined by Sections 1 through 9 of this document.
"Licensor" shall mean the copyright owner or entity authorized by the copyright owner that is granting the License.
"Legal Entity" shall mean the union of the acting entity and all other entities that control, are controlled by, or are under common control with that entity.
"You" (or "Your") shall mean an individual or Legal Entity exercising permissions granted by this License.
"Source" form shall mean the preferred form for making modifications, including but not limited to software source code, documentation source, and configuration files.
"Object" form shall mean any form resulting from mechanical transformation or translation of a Source form, including but not limited to compiled object code, generated documentation, and conversions to other media types.
"Work" shall mean the work of authorship, whether in Source or Object form, made available under the License, as indicated by a copyright notice that is included in or attached to the work.
"Derivative Works" shall mean any work, whether in Source or Object form, that is based on (or derived from) the Work and for which the editorial revisions, annotations, elaborations, or other modifications represent, as a whole, an original work of authorship.
"Contribution" shall mean any work of authorship, including the original version of the Work and any modifications or additions to that Work and Derivative Works thereof, that is intentionally submitted to Licensor for inclusion in the Work by the copyright owner or by an individual or Legal Entity authorized to submit on behalf of the copyright owner.
"Contributor" shall mean Licensor and any individual or Legal Entity on behalf of whom a Contribution has been received by Licensor and subsequently incorporated within the Work.

2. Grant of Copyright License. Subject to the terms and conditions of this License, each Contributor hereby grants to You a perpetual, worldwide, non‑exclusive, no‑charge, royalty‑free, irrevocable copyright license to reproduce, prepare Derivative Works of, publicly display, publicly perform, sublicense, and distribute the Work and such Derivative Works in Source or Object form.

3. Grant of Patent License. Subject to the terms and conditions of this License, each Contributor hereby grants to You a perpetual, worldwide, non‑exclusive, no‑charge, royalty‑free, irrevocable (except as stated in this section) patent license to make, have made, use, offer to sell, sell, import, and otherwise transfer the Work, where such license applies only to those patent claims licensable by such Contributor that are necessarily infringed by their Contribution(s) alone or by combination of their Contribution(s) with the Work to which such Contribution(s) was submitted.

4. Redistribution. You may reproduce and distribute copies of the Work or Derivative Works thereof in any medium, with or without modifications, and in Source or Object form, provided that You meet the following conditions:
   (a) You must give any other recipients of the Work or Derivative Works a copy of this License; and
   (b) You must cause any modified files to carry prominent notices stating that You changed the files; and
   (c) You must retain, in the Source form of any Derivative Works that You distribute, all copyright, patent, trademark, and attribution notices from the Source form of the Work, excluding those notices that do not pertain to any part of the Derivative Works; and
   (d) If the Work includes a "NOTICE" text file as part of its distribution, then any Derivative Works that You distribute must include a readable copy of the attribution notices contained within such NOTICE file, excluding those notices that do not pertain to any part of the Derivative Works, in at least one of the following places: within a NOTICE text file distributed as part of the Derivative Works; within the Source form or documentation, if provided along with the Derivative Works; or, within a display generated by the Derivative Works, if and wherever such third‑party notices normally appear. The contents of the NOTICE file are for informational purposes only and do not modify the License. You may add Your own attribution notices within Derivative Works that You distribute, alongside or as an addendum to the NOTICE file from the Work, provided that such additional attribution notices cannot be construed as modifying the License.

5. Submission of Contributions. Unless You explicitly state otherwise, any Contribution intentionally submitted for inclusion in the Work by You to the Licensor shall be under the terms and conditions of this License, without any additional terms or conditions.

6. Trademarks. This License does not grant permission to use the trade names, trademarks, service marks, or product names of the Licensor, except as required for reasonable and customary use in describing the origin of the Work and reproducing the content of the NOTICE file.

7. Disclaimer of Warranty. Unless required by applicable law or agreed to in writing, Licensor provides the Work (and each Contributor provides its Contributions) on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied, including, without limitation, any warranties or conditions of TITLE, NON‑INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A PARTICULAR PURPOSE.

8. Limitation of Liability. In no event and under no legal theory, whether in tort (including negligence), contract, or otherwise, unless required by applicable law (such as deliberate and grossly negligent acts) or agreed to in writing, shall any Contributor be liable to You for damages, including any direct, indirect, special, incidental, or consequential damages of any character arising as a result of this License or out of the use or inability to use the Work (including but not limited to damages for loss of goodwill, work stoppage, computer failure or malfunction, or any and all other commercial damages or losses), even if such Contributor has been advised of the possibility of such damages.

9. Accepting Warranty or Additional Liability. While redistributing the Work or Derivative Works thereof, You may choose to offer, and charge a fee for, acceptance of support, warranty, indemnity, or other liability obligations and/or rights consistent with this License. However, in accepting such obligations, You may act only on Your own behalf and on Your sole responsibility, not on behalf of any other Contributor.

END OF TERMS AND CONDITIONS
```

---

### BSD 3‑Clause License (Text)

```
BSD 3‑Clause License

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

---

## 3) Attribution

* **CrewAI** © crewAI Inc. Licensed under MIT.
* **langchain-openai** © LangChain contributors. Licensed under MIT.
* **FastAPI** © Sebastián Ramírez and contributors. Licensed under MIT.
* **Starlette** © Encode OSS Ltd and contributors. Licensed under BSD‑3‑Clause.
* **Pydantic** © Samuel Colvin and contributors. Licensed under MIT.
* **Uvicorn** © Encode OSS Ltd and contributors. Licensed under BSD‑3‑Clause.
* **python-dotenv** © Saurabh Kumar and contributors. Licensed under BSD‑3‑Clause.
* **Google ADK** © Google LLC and contributors. Licensed under Apache‑2.0.

---

## 4) Notes on Model Output Ownership

When you use model APIs (e.g., OpenAI or Gemini) with these libraries, Accorria retains ownership of **inputs and outputs** per those providers' terms. Ensure your account's data‑use settings meet your privacy requirements.

---

*Last updated: December 2024*
